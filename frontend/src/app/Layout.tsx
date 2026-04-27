import { ParentComponent } from 'solid-js';

import * as styles from './Layout.css';

const Layout: ParentComponent = (props) => (
  <div class={styles.layout}>
    <aside class={styles.sidebar}>
      <nav>{/* sidebar nav links */}</nav>
    </aside>

    <main class={styles.content}>{props.children}</main>

    <nav class={styles.bottomNav}>{/* mobile bottom nav */}</nav>
  </div>
);

export default Layout;
