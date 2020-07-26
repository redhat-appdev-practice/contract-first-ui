<template>
  <q-page class="column fill-screen">
    <q-input class="row-1" label="Title" v-model="editing.title" :rules="[val => !!val && val != '' || 'Title is required']"/>
    <q-input class="row" label="Desciption" v-model="editing.description" type="textarea" />
    <q-checkbox class="row-1" label="Complete?" v-model="editing.complete" />
    <q-input class="row-1" filled v-model="editing.dueDate" mask="date" :rules="['editing.dueDate']">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <q-date today-btn mask="YYYY-MM-DD" v-model="editing.dueDate" title="Due Date" @input="$refs.qDateProxy.hide()" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <div class="row-1">
      <q-btn :label="actionButtonText" color="primary" text-color="negative" :disable="isDisabled" @click="updateOrAddTodo" />&nbsp;
      <q-btn label="Cancel" color="primary" text-color="negative" @click="$router.back()" />
    </div>
  </q-page>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Todo, NewTodo } from '../apiClient/index';
import { AxiosError, AxiosResponse } from 'axios';
import { ApiWrapper } from '../WrapperTypes';

@Component
export default class EditTodo extends Vue {
  @Prop({default: null})
  id?: string

  addTodo(todo: NewTodo) {
    this.$q.loading.show();
    (this.$api as ApiWrapper).todos.createTodo(todo)
      .then((res: AxiosResponse) => {
        this.$q.loading.hide();
        this.$store.commit('app/addTodo', res.data);
        void this.$router.push({ name: 'home' });
      })
      .catch((err: AxiosError) => {
        this.$q.loading.hide();
        this.$q.notify({
          type: 'warning',
          message: `Error loading data from server: ${err.message}`
        })
      });
  }

  updateTodo(todo: Todo) {
    this.$q.loading.show();
    (this.$api as ApiWrapper).todos.updateTodo(this.id!, todo)
      .then((res: AxiosResponse) => {
        this.$q.loading.hide();
        this.$store.commit('app/updateTodo', res.data);
        void this.$router.push({ name: 'home' });
      })
      .catch((err: AxiosError) => {
        this.$q.loading.hide();
        this.$q.notify({
          type: 'warning',
          message: `Error loading data from server: ${err.message}`
        })
      });
  }

  updateOrAddTodo() {
    let todoItem = { ...this.$data.editing }
    todoItem.author = this.$store.state.app.user.preferred_username;
    if (this.$data.editing.id == undefined) {
      this.addTodo(todoItem);
    } else {
      this.updateTodo(todoItem);
    }
  }

  todoHasBeenModified(a: NewTodo, b: NewTodo) {
    // Create arrays of property names
    return (
      a.title == b.title &&
      a.complete == b.complete
    );
  }

  mounted() {
    // Initialize the holder object if it is not already populated
    if (this.isNewTodo) {
      this.$data.editing = { title: '', description: '', complete: false, dueDate: '' };
    } else if (this.isEdit) {
      // If the user hits the reload button in the browser, we want to restore the state
      const loadedFromState = this.$store.state.app.todos.find((item: Todo) => item.id == this.$props.id);
      this.$data.editing = {...loadedFromState};
    }
  }

  get isNewTodo() {
    return (this.$props.id === undefined || this.$props.id == null);
  }

  get isEdit() {
    return (this.$props.id !== undefined && this.$props.id !== null && this.$props.id != '');
  }

  get isDisabled() {
    if (this.isEdit) {
      const loadedFromState: NewTodo = this.$store.state.app.todos.find((item: Todo) => item.id == this.$props.id);
      let original: NewTodo = {...loadedFromState};
      const current = {...this.$data.editing};

      return this.todoHasBeenModified(original, current);
    } else if (this.isNewTodo) {
      return (this.$data.editing.title === undefined || this.$data.editing.title === null && this.$data.editing.title.length == 0);
    }
    return false;
  }

  get actionButtonText() {
    return this.isEdit ? 'Save' : 'Add';
  }
}
</script>

<style lang="sass" scoped>
.form
  width: 95%
  margin: 0.2em
  text-align: top
.fill-screen
  margin-top: 0px
  margin-bottom: 0px
  height: 100%
</style>
