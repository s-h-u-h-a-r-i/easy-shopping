import {
  Component,
  ComponentProps,
  createUniqueId,
  Show,
  splitProps,
  type JSX,
} from 'solid-js';

import * as styles from './Input.css';

export type InputSize = 'sm' | 'md' | 'lg';

type InputOwnProps = {
  label?: string;
  hint?: string;
  error?: string;
  size?: InputSize;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  class?: string;
};

type InputProps = InputOwnProps &
  Omit<ComponentProps<'input'>, keyof InputOwnProps>;

const Input: Component<InputProps> = (props) => {
  const id = createUniqueId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const [local, rest] = splitProps(props, [
    'label',
    'hint',
    'error',
    'size',
    'fullWidth',
    'startIcon',
    'endIcon',
    'class',
  ]);

  const size = () => local.size ?? 'md';

  const fieldClasses = () =>
    [
      styles.field,
      styles.sizeStyles[size()],
      local.fullWidth && styles.fullWidth,
      local.error && styles.fieldError,
      local.class,
    ]
      .filter(Boolean)
      .join(' ');

  const describedBy = () =>
    [local.error ? errorId : null, !local.error && local.hint ? hintId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div class={fieldClasses()}>
      <Show when={local.label}>
        <label class={styles.label} for={id}>
          {local.label}
        </label>
      </Show>

      <div class={styles.inputRow}>
        <Show when={local.startIcon}>
          <span class={styles.iconSlot} aria-hidden="true">
            {local.startIcon}
          </span>
        </Show>

        <input
          class={styles.inputEl}
          id={id}
          aria-describedby={describedBy()}
          aria-invalid={!!local.error || undefined}
          {...rest}
        />

        <Show when={local.endIcon}>
          <span class={styles.iconSlot} aria-hidden="true">
            {local.endIcon}
          </span>
        </Show>
      </div>

      <Show when={local.hint && !local.error}>
        <span class={styles.hint} id={hintId}>
          {local.hint}
        </span>
      </Show>

      <Show when={local.error}>
        <span class={styles.errorMsg} id={errorId} role="alert">
          {local.error}
        </span>
      </Show>
    </div>
  );
};

export default Input;
