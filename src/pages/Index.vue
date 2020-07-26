<template>
  <q-page>
    <div class="row header-title">
      <div class="action-buttons col-1">&nbsp;</div>
      <div class="col-grow">Title</div>
      <div class="narrow centered col-1">Due</div>
      <div class="narrow centered col-1">
        <q-icon name="check" />
      </div>
    </div>
    <q-scroll-area style="height: 85vh;">
      <div class="row todo-list" v-for="todo in app.todos" :key="todo.id">
        <div class="action-buttons col-1">
          <q-btn size="sm" round icon="edit" @click="edit(todo)" />
          <q-btn size="sm" round icon="delete" @click="deleteTodo(todo.id)" />
        </div>
        <div class="col">
          <q-expansion-item
            header-style="width=100%;"
            v-if="todo.description"
            dense
            :label="todo.title"
          >
            <q-card v-if="todo.description" style="background-color: inherit;">
              <q-card-section>{{ todo.description }}</q-card-section>
            </q-card>
          </q-expansion-item>
          <q-item v-else>{{ todo.title }}</q-item>
        </div>
        <div class="narrow centered col-1">
          <q-icon name="done"
                  v-if="isOverdue(todo.dueDate)"
                  class="text-red"
                  style="font-size: 1.5rem;"
          />
          {{ todo.dueDate | daysRemaining }}
        </div>
        <div class="narrow centered col-1">
          <q-checkbox @input="toggleComplete(todo)" :value="todo.complete" />
        </div>
      </div>
    </q-scroll-area>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="secondary" to="/new" />
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { mapState } from 'vuex';
import { Todo } from 'src/apiClient';
import { ApiWrapper } from '../WrapperTypes';
import { AxiosError } from 'axios';
import moment from 'moment';

@Component({
  computed: {
    ...mapState(['app'])
  },
  filters: {
    daysRemaining: function(dueDate) {
      if (dueDate === undefined || dueDate === null || dueDate == '') {
        return '';
      }
      const dueDate = new Date(dueDate);
      const today = new Date();
      dueDate.setHours(0, 0, 0);
      today.setHours(0,0,0);
      const millisInSecond = 1000;
      const secondsInMinute = 60;
      const minutesPerHour = 60;
      const hoursPerDay = 24;
      const toDaysConversion = millisInSecond*secondsInMinute*minutesPerHour*hoursPerDay;
      const differenceInDays = Math.round((dueDate-today)/toDaysConversion);
      if (differenceInDays<0) {
        return `${Math.abs(differenceInDays)} days ago`;
      } else if (differenceInDays == 0) {
        return 'Today';
      } else {
        return `${differenceInDays} days`
      }
    }
  }
})
export default class PageIndex extends Vue {
  /**
   * Toggles the completion state of a Todo item
   * @param todo A Todo item which represents a single row of data
   */
  toggleComplete(todo: Todo) {
    this.$q.loading.show();
    let updated = { ...todo };
    updated.complete = !todo.complete;
    (this.$api as ApiWrapper).todos
      .updateTodo(updated.id ?? '', updated)
      .then(res => {
        this.$store.commit('app/updateTodo', res.data);
        this.$q.loading.hide();
      })
      .catch(err => {
        this.$q.loading.hide();
        this.$q.notify({
          type: 'warning',
          message: `Error updating completion status: ${err.message}`
        });
      });
  }

  /**
   * Open the associated Todo item in an editor
   * @param todo A Todo item which represents a single row of data
   */
  edit(todo: Todo) {
    void this.$router.push({ name: 'edit', params: { id: todo.id ?? '' } });
  }

  /**
   * Check the dueDate versus the current date to see if an item is overdue.
   */
  isOverdue(dueDate: string) {
    let parsedDueDate = moment.parseZone(dueDate);
    return parsedDueDate.isSameOrBefore(moment.now());
  }

  /**
   * Confirm that the user intended to delete the item, and then delete it via an API call if desired.
   */
  deleteTodo(id: string) {
    this.$q
      .dialog({
        title: 'CONFIRM',
        message: 'Are you sure? This action cannot be reversed.',
        cancel: true,
        persistent: true
      })
      .onOk(() => {
        this.$q.loading.show();
        (this.$api as ApiWrapper).todos
          .deleteTodo(id)
          .then(res => {
            if (res.status != 204) {
              throw { message: 'Invalid response code' } as AxiosError;
            }
            this.$store.commit('app/deleteTodo', id);
            this.$q.loading.hide();
          })
          .catch(err => {
            this.$q.loading.hide();
            this.$q.notify({
              type: 'warning',
              message: `Error deleting todo: ${err.message}`
            });
          });
      })
      .onCancel(() => {
        this.$q.notify({
          type: 'info',
          message: 'Cancelled delete'
        });
      });
  }


};
</script>

<style lang="sass" scoped>
.indent
  padding-left: 1.3em
.narrow
  border-left: 1px solid rgba(0, 0, 0, 0.1)
  width: 3.5rem
.action-buttons
  border-right: 1px solid rgba(0, 0, 0, 0.1)
  width: 2rem
.q-icon
  font-size: 1.6rem
.header-title
  font-weight: bold
  font-size: 2.8vh
  text-align: left
  height: 5vh
  width: 100vw
  color: $secondary
  background-color: $negative
  font-family: 'Red Hat Display', sans-serif
.todo-list
  width: 100vw
  padding-top: 0.3rem
  padding-bottom: 0.3rem
  min-height: 4rem
  font-size: 2.2vh
  font-family: 'Red Hat Display', sans-serif
.todo-list:nth-child(even)
  background-color: $negative
.centered
  text-align: center
  font-family: 'Red Hat Display', sans-serif
</style>
