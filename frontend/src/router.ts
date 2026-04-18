import { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';

export const routes: RouteDefinition[] = [
  {
    path: '/ui',
    component: lazy(() => import('./pages/ui/UiIndexPage')),
    children: [
      {
        path: '/',
      },
      {
        path: '/buttons',
        component: lazy(() => import('./pages/ui/buttons/ButtonsPage')),
      },
      {
        path: '/inputs',
        component: lazy(() => import('./pages/ui/inputs/InputsPage')),
      },
    ],
  },
];
