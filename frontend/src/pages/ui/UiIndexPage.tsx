import { A, RouteSectionProps } from '@solidjs/router';
import { Component, Index } from 'solid-js';

import styles from './UiIndexPage.module.scss';

const uiDemoPages = ['buttons'] as const;

const UiIndexPage: Component<RouteSectionProps> = (props) => {
  return (
    <div class={styles.layout}>
      <nav class={styles.nav}>
        <Index each={uiDemoPages}>
          {(page) => (
            <A href={page()} class={styles.navItem} activeClass={styles.active}>
              {page()}
            </A>
          )}
        </Index>
      </nav>
      <main class={styles.content}>{props.children}</main>
    </div>
  );
};

export default UiIndexPage;
