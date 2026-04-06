import { Component } from 'solid-js';
import styles from './Layout.module.scss';

const Layout: Component = () => (
  <div class={styles.layout}>
    <aside class={styles.sidebar}>
      <nav>{/* sidebar nav links */}</nav>
    </aside>

    <main class={styles.content}></main>

    <nav class={styles.bottomNav}>{/* mobile bottom nav */}</nav>
  </div>
);

export default Layout;
