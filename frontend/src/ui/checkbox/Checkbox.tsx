import IconCheck from 'lucide-solid/icons/check';
import { Component, ComponentProps, ParentComponent, Show, splitProps } from 'solid-js';

import styles from './Checkbox.module.scss';

export type CheckboxSize = 'sm' | 'md' | 'lg';

type CheckboxOwnProps = {
  size?: CheckboxSize;
  indeterminate?: boolean;
  class?: string;
};

type CheckboxProps = CheckboxOwnProps &
  Omit<ComponentProps<'input'>, keyof CheckboxOwnProps | 'type'>;

const Checkbox: ParentComponent<CheckboxProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'size',
    'indeterminate',
    'class',
    'children',
  ]);

  const size = () => local.size ?? 'md';

  const classes = () =>
    [
      styles.checkbox,
      styles[size()],
      rest.disabled && styles.disabled,
      local.class,
    ]
      .filter(Boolean)
      .join(' ');

  const controlClasses = () =>
    [
      styles.control,
      rest.checked && styles.checked,
      local.indeterminate && styles.indeterminate,
      rest.disabled && styles.disabled,
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <label class={classes()}>
      <input
        ref={(el) => {
          el.indeterminate = !!local.indeterminate;
        }}
        type="checkbox"
        class={styles.input}
        aria-checked={local.indeterminate ? 'mixed' : rest.checked}
        {...rest}
      />
      <span class={controlClasses()} aria-hidden="true">
        <Show when={rest.checked && !local.indeterminate}>
          <IconCheck class={styles.icon} />
        </Show>
        <Show when={local.indeterminate}>
          <span class={styles.indeterminateDash} />
        </Show>
      </span>
      {local.children}
    </label>
  );
};

export default Checkbox;
