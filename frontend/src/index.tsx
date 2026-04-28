/* @refresh reload */
import { Router } from '@solidjs/router';
import 'solid-devtools';
import { lazy } from 'solid-js';
import { render } from 'solid-js/web';

import Layout from './app/Layout';
import { ThemeProvider } from './lib/theme';
import { routes } from './router';
import './styles/default.css.ts';
import './styles/global.css.ts';

// Static env check — false branch is dead-code eliminated by Rollup in production.
// DevPanel and src/dev/ never ship outside mock mode.
const DevPanel = import.meta.env.VITE_MOCK
  ? lazy(() => import('./dev/DevPanel'))
  : () => null;

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(
  () => (
    <ThemeProvider>
      <Router root={Layout} children={routes} />
      <DevPanel />
    </ThemeProvider>
  ),
  root!,
);
