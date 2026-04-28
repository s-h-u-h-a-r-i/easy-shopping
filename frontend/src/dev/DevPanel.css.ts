import { style } from '@vanilla-extract/css';

import { vars } from '../styles/contract.css';

export const root = style({
  position: 'fixed',
  bottom: '1rem',
  right: '1rem',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '0.5rem',
});

export const toggle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  background: vars.color.card,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.mutedForeground,
  cursor: 'pointer',
  transition: 'color 150ms ease, border-color 150ms ease',
  ':hover': {
    color: vars.color.foreground,
    borderColor: vars.color.foreground,
  },
});

export const panel = style({
  background: vars.color.card,
  border: `1px solid ${vars.color.border}`,
  padding: '0.875rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
  minWidth: '180px',
});
