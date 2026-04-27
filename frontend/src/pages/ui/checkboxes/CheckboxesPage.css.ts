import { style } from '@vanilla-extract/css';

import { vars } from '../../../styles/contract.css';

export const page = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const heading = style({
  fontSize: '0.875rem',
  fontWeight: vars.font.weightMedium,
  color: vars.color.foreground,
  margin: 0,
});

export const col = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  alignItems: 'flex-start',
});

export const row = style({
  display: 'flex',
  flexDirection: 'row',
  gap: '1rem',
  alignItems: 'center',
});
