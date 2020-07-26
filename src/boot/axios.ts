import Vue from 'vue';
import { TodosApi } from '../apiClient/index';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
Vue.prototype.$api = { todos: new TodosApi() };
