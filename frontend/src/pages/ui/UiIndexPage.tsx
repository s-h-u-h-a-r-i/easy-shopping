import { A, RouteSectionProps } from '@solidjs/router';

import Button from '@/ui/Button';
import { Component } from 'solid-js';

const UiIndexPage: Component<RouteSectionProps> = (props) => (
  <div>
    <nav>
      <Button as={A} href="buttons">
        Buttons
      </Button>
    </nav>
    {props.children}
  </div>
);

export default UiIndexPage;
