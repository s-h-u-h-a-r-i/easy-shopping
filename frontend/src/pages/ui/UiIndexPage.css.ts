import { style } from '@vanilla-extract/css';

import { vars } from '../../styles/contract.css';

export const layout = style({
  display: 'flex',
  flexDirection: 'column',
});

export const nav = style({
  display: 'flex',
  flexDirection: 'row',
  padding: '0 1.5rem 1rem',
});

export const navItem = style({
  textTransform: 'capitalize',
  textDecoration: 'none',
  color: vars.color.mutedForeground,
  padding: '0.5rem 1rem',
  selectors: {
    '& + &': {
      borderLeft: `1px solid ${vars.color.border}`,
    },
  },
});

export const navItemActive = style({
  color: vars.color.foreground,
  textShadow: `0 0 12px ${vars.color.foreground}`,
  '@media': {
    '(prefers-color-scheme: light)': {
      textShadow: 'none',
      color: vars.color.primary,
    },
  },
});

export const content = style({
  padding: '2rem 1.5rem',
});
