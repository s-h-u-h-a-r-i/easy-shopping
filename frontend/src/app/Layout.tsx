import { ParentComponent } from 'solid-js';

import * as styles from './Layout.css';

const Layout: ParentComponent = (props) => (
  <div class={styles.layout}>
    <main class={styles.content}>{props.children}</main>

    <nav class={styles.bottomNav}>{/* mobile bottom nav */}</nav>
  </div>
);

export default Layout;
