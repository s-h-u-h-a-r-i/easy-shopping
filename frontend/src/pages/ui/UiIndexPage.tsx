import { A, RouteSectionProps } from '@solidjs/router';
import { Component } from 'solid-js';

import Button from '@/ui/Button';
import styles from './UiIndexPage.module.scss';

const UiIndexPage: Component<RouteSectionProps> = (props) => (
  <div class={styles.layout}>
    <nav class={styles.nav}>
      <Button as={A} href="buttons">
        Buttons
      </Button>
    </nav>
    <main class={styles.content}>{props.children}</main>
  </div>
);

export default UiIndexPage;
