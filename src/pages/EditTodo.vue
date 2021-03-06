<template>
  <q-page class="column fill-screen">
    <q-input class="row-1" label="Title" v-model="editing.title" :rules="[val => !!val && val != '' || 'Title is required']"/>
    <q-checkbox class="row-1" label="Complete?" v-model="editing.complete" />
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
  editing: NewTodo = {title: ''};

  @Prop({default: null})
  id?: string;

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
    let todoItem = { ...this.editing } as Todo;
    if (this.editing?.id == undefined) {
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
      console.log("New Todo");
      this.editing = { title: '', complete: false };
    } else if (this.isEdit) {
      console.log("Edit Todo");
      // If the user hits the reload button in the browser, we want to restore the state
      const loadedFromState = this.$store.state.app.todos.find((item: Todo) => item.id == this.id!);
      console.log(`Loaded from state: ${JSON.stringify(loadedFromState)}`);
      if (loadedFromState == null) {
        console.log("Null Todo");
        (this.$api as ApiWrapper).todos.getTodo(this.id!)
          .then((res: AxiosResponse) => {
            console.log(`Retrieved Todo: ${JSON.stringify(res.data)}`);
            this.editing = { ...res.data } as Todo
          })
          .catch((err: AxiosError) => this.$q.notify({
            type: 'warning',
            message: `Error loading Todo for '${this.id}'`
          }))
      } else {
        this.editing = { ...loadedFromState } as Todo;
        console.log(`Cached Todo: ${JSON.stringify(this.editing)}`);
      }
    }
  }

  get isNewTodo() {
    return (this.id === null);
  }

  get isEdit() {
    return (this.id !== undefined && this?.id != '');
  }

  get isDisabled() {
    if (this.isEdit) {
      const loadedFromState: NewTodo = this.$store.state.app.todos.find((item: Todo) => item.id == this.id);
      let original: NewTodo = {...loadedFromState};
      const current = {...this.editing} as NewTodo;

      return this.todoHasBeenModified(original, current);
    } else if (this.isNewTodo) {
      return (this.editing?.title === undefined && this.editing?.title);
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
