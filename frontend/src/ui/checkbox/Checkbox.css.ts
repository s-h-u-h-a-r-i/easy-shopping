import { globalStyle, style, styleVariants } from '@vanilla-extract/css';

import { vars } from '../../styles/contract.css';

export const checkbox = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  userSelect: 'none',
  WebkitUserSelect: 'none',
});

export const disabledState = style({
  opacity: 0.4,
  pointerEvents: 'none',
});

export const input = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const control = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.inputBackground,
  color: vars.color.primaryForeground,
  transition: 'background-color 150ms ease, border-color 150ms ease',
});

export const checkedControl = style({
  background: vars.color.primary,
  borderColor: vars.color.primary,
});

// Focus-visible ring via :has() — hashed class refs keep scoping intact
globalStyle(`${checkbox}:has(${input}:focus-visible) ${control}`, {
  outline: `2px solid ${vars.color.ring}`,
  outlineOffset: '2px',
});

// Size styles applied directly to control + icon so no parent→child selector needed
export const controlSizes = styleVariants({
  sm: { width: '1rem', height: '1rem', borderRadius: '0.25rem' },
  md: { width: '1.25rem', height: '1.25rem', borderRadius: '0.25rem' },
  lg: { width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem' },
});

export const iconSizes = styleVariants({
  sm: { width: '0.75rem', height: '0.75rem', strokeWidth: 3 },
  md: { width: '0.875rem', height: '0.875rem', strokeWidth: 3 },
  lg: { width: '1rem', height: '1rem', strokeWidth: 3 },
});

export const indeterminateDash = style({
  width: '60%',
  height: '2px',
  background: 'currentColor',
  borderRadius: '1px',
});
