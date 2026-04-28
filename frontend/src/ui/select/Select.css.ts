import { globalStyle, style, styleVariants } from '@vanilla-extract/css';

import { vars } from '../../styles/contract.css';

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
  selectors: {
    '&:has(select:disabled)': {
      opacity: 0.4,
      pointerEvents: 'none',
    },
  },
});

export const fullWidth = style({ width: '100%' });

export const fieldError = style({});

export const label = style({
  fontSize: '0.75rem',
  fontWeight: vars.font.weightMedium,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: vars.color.mutedForeground,
  transition: 'color 150ms ease',
});

globalStyle(`${field}:focus-within ${label}`, { color: vars.color.foreground });
globalStyle(`${fieldError} ${label}`, { color: vars.color.foreground });

export const selectRow = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  borderBottom: `1px solid ${vars.color.border}`,
  transition: 'border-color 150ms ease',
  ':focus-within': {
    borderBottomColor: vars.color.primary,
  },
});

globalStyle(`${fieldError} ${selectRow}`, { borderBottomColor: vars.color.destructive });

export const selectEl = style({
  flex: 1,
  minWidth: 0,
  width: '100%',
  paddingRight: '1.25rem',
  appearance: 'none',
  background: 'none',
  border: 'none',
  outline: 'none',
  color: vars.color.foreground,
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  cursor: 'pointer',
});

export const iconSlot = style({
  position: 'absolute',
  right: 0,
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  color: vars.color.mutedForeground,
  pointerEvents: 'none',
  transition: 'color 150ms ease',
});

globalStyle(`${field}:focus-within ${iconSlot}`, { color: vars.color.foreground });
globalStyle(`${fieldError} ${iconSlot}`, { color: vars.color.destructive });

export const hint = style({
  fontSize: '0.75rem',
  color: vars.color.mutedForeground,
});

export const errorMsg = style({
  fontSize: '0.75rem',
  color: vars.color.destructive,
});

export const sizeStyles = styleVariants({
  sm: {},
  md: {},
  lg: {},
});

globalStyle(`${sizeStyles.sm} ${selectRow}`, { height: '2rem' });
globalStyle(`${sizeStyles.sm} ${selectEl}`, { fontSize: '0.8125rem' });
globalStyle(`${sizeStyles.md} ${selectRow}`, { height: '2.5rem' });
globalStyle(`${sizeStyles.md} ${selectEl}`, { fontSize: '0.875rem' });
globalStyle(`${sizeStyles.lg} ${selectRow}`, { height: '3rem' });
globalStyle(`${sizeStyles.lg} ${selectEl}`, { fontSize: '1rem' });
