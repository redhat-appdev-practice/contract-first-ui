<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <img src="redhat_logo_red.svg" class="logo"><span class="title">Todo App</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="sass" scoped>
.q-checkbox__label
  word-wrap: normal
.name
  color: black
  font-weight: 600
  background-color: $negative
  font-family: 'Red Hat Display', sans-serif
.logo
  margin-top: 1vh
  margin-right: 0.5rem
  margin-left: 0rem
  float: left
  height: 8vh
.q-checkbox
  font-size: 0.75rem
.title
  font-family: 'Red Hat Display', sans-serif
  font-weight: bold
  line-height: 10vh
.fixed-height
  height: 10vh
</style>


<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { AxiosError, AxiosResponse } from 'axios';

@Component
export default class MainLayout extends Vue {
  mounted() {
    this.$q.loading.show(); // Show loading indicator
    this.$api.todos.getTodos()
      .then(this.loadTodosOnMount)
      .catch(this.handleApiError);
  }

  loadTodosOnMount(response: AxiosResponse) {
    this.$q.loading.hide(); // Hide loading indicator
    this.$store.commit('app/loadTodos', response.data);  // Store the loaded Todos in the global Vuex state
  }

  handleApiError(err: AxiosError) {
    this.$q.loading.hide(); // Hide loading indicator
    this.$q.notify({  // Notify the user of the error using a snackbar
      type: 'warning',
      message: `Error loading data from server: ${err.message}`
    });
  }
}
</script>
