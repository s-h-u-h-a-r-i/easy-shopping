import { A, RouteSectionProps, useNavigate } from '@solidjs/router';
import { Component, Index } from 'solid-js';

import * as styles from './UiIndexPage.css';

const uiDemoPages = ['buttons', 'inputs', 'checkboxes'] as const;

const UiIndexPage: Component<RouteSectionProps> = (props) => {
  const navigator = useNavigate();

  return (
    <div class={styles.layout}>
      <nav class={styles.nav}>
        <Index each={uiDemoPages}>
          {(page) => (
            <A
              href={page()}
              class={styles.navItem}
              activeClass={styles.navItemActive}
              onMouseEnter={() => navigator(page())}>
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
