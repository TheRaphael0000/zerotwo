import Vue from 'vue';
import Router from 'vue-router';
import AniList from '@/routes/AniList';
import Search from '@/views/Search.vue';
import Settings from '@/views/Settings.vue';

Vue.use(Router);

export default new Router({
  routes: [
    ...AniList,
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
      meta: {
        routeName: 'settings',
      },
    },
    {
      path: '/search',
      name: 'Search',
      component: Search,
      meta: {
        searchablePage: true,
        routeName: 'search',
      },
      children: [{
        path: ':query',
      }],
    },
    {
      path: '*',
      redirect: '/aniList',
    },
  ],
});
