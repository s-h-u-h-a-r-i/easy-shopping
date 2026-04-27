import { style } from '@vanilla-extract/css';

import { vars } from '../../../styles/contract.css';

export const page = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2.5rem',
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const heading = style({
  fontSize: '0.75rem',
  fontWeight: vars.font.weightMedium,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: vars.color.mutedForeground,
  margin: 0,
});

export const row = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.75rem',
});
