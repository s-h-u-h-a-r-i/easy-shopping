import { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';

export const routes: RouteDefinition[] = [
  {
    path: '/ui',
    component: lazy(() => import('./pages/UiPlayground')),
  },
];
