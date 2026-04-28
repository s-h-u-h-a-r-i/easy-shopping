import { ChevronDown } from 'lucide-solid';
import { Component, ComponentProps, createUniqueId, Show, splitProps } from 'solid-js';

import * as styles from './Select.css';

export type SelectSize = 'sm' | 'md' | 'lg';

type SelectOwnProps = {
  label?: string;
  hint?: string;
  error?: string;
  size?: SelectSize;
  fullWidth?: boolean;
  children?: ComponentProps<'select'>['children'];
  class?: string;
};

type SelectProps = SelectOwnProps &
  Omit<ComponentProps<'select'>, keyof SelectOwnProps>;

const Select: Component<SelectProps> = (props) => {
  const id = createUniqueId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const [local, rest] = splitProps(props, [
    'label',
    'hint',
    'error',
    'size',
    'fullWidth',
    'children',
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

      <div class={styles.selectRow}>
        <select
          class={styles.selectEl}
          id={id}
          aria-describedby={describedBy()}
          aria-invalid={!!local.error || undefined}
          {...rest}
        >
          {local.children}
        </select>

        <span class={styles.iconSlot} aria-hidden="true">
          <ChevronDown size={14} />
        </span>
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

export default Select;
