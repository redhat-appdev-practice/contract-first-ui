import { RouteConfig } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'home', path: '', component: () => import('pages/Index.vue') },
      { name: 'new', path: 'new', component: () => import('pages/EditTodo.vue') },
      { name: 'edit', path: 'edit/:id', component: () => import('pages/EditTodo.vue'), props: (route) => ({ id: route.params.id }) }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
];

export default routes;
