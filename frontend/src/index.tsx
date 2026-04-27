/* @refresh reload */
import 'solid-devtools';
import { render } from 'solid-js/web';

import { Router } from '@solidjs/router';
import Layout from './app/Layout';
import { ThemeProvider } from './lib/theme';
import { routes } from './router';
import './styles/default.css.ts';
import './styles/global.css.ts';

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
    </ThemeProvider>
  ),
  root!,
);
