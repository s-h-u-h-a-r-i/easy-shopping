import {
  Component,
  ComponentProps,
  Show,
  splitProps,
  type JSX,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import * as styles from './Button.css';

type AsProp = keyof HTMLElementTagNameMap | Component<any>;

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

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
      styles.sizeStyles[size()],
      styles.variantStyles[variant()],
      local.fullWidth && styles.fullWidth,
      local.loading && styles.loadingState,
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
        <span class={styles.icon} aria-hidden="true">
          {local.startIcon}
        </span>
      </Show>

      <Show when={local.loading}>
        <span class={styles.spinner} aria-hidden="true"></span>
      </Show>

      <span class={styles.label}>{local.children}</span>

      <Show when={local.endIcon && !local.loading}>
        <span class={styles.icon} aria-hidden="true">
          {local.endIcon}
        </span>
      </Show>
    </Dynamic>
  );
};

export default Button;
