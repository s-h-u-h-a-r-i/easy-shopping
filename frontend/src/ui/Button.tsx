import {
  Component,
  ComponentProps,
  Show,
  splitProps,
  type JSX,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import styles from './Button.module.scss';

type AsProp = keyof HTMLElementTagNameMap | Component<any>;

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  children?: JSX.Element;
  class?: string;
};

type ButtonProps<T extends AsProp = 'button'> = ButtonOwnProps & {
  as?: T;
} & Omit<ComponentProps<T>, keyof ButtonOwnProps | 'as'>;

const Button = <T extends AsProp = 'button'>(props: ButtonProps<T>) => {
  const [local, rest] = splitProps(props, [
    'variant',
    'size',
    'loading',
    'fullWidth',
    'startIcon',
    'endIcon',
    'as',
    'children',
    'class',
  ]);

  const variant = () => local.variant ?? 'primary';
  const size = () => local.size ?? 'md';

  const classes = () =>
    [
      styles.button,
      styles[size()],
      styles[variant()],
      local.fullWidth && styles.fullWidth,
      local.loading && styles.loading,
      local.class,
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <Dynamic
      component={local.as ?? 'button'}
      class={classes()}
      disabled={rest.disabled || local.loading}
      aria-busy={local.loading}
      {...rest}>
      <Show when={local.startIcon && !local.loading}>
        <span class={styles.icon} aria-hidden>
          {local.startIcon}
        </span>
      </Show>

      <Show when={local.loading}>
        <span class={styles.spinner} aria-hidden></span>
      </Show>

      <span class={styles.label}>{local.children}</span>

      <Show when={local.endIcon && !local.loading}>
        <span class={styles.icon} aria-hidden>
          {local.endIcon}
        </span>
      </Show>
    </Dynamic>
  );
};

export default Button;
