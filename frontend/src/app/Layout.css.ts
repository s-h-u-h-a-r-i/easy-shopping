import { style } from '@vanilla-extract/css';

import { bp } from '../styles/breakpoints';
import { vars } from '../styles/contract.css';

export const layout = style({
  display: 'grid',
  height: '100vh',
  overflow: 'hidden',
  gridTemplateRows: '1fr auto',
  gridTemplateAreas: "'content' 'bottom-nav'",
  '@media': {
    [`(min-width: ${bp.tablet}px)`]: {
      gridTemplateColumns: `${vars.layout.sidebarWidth} 1fr`,
      gridTemplateRows: '1fr',
      gridTemplateAreas: "'sidebar content'",
    },
  },
});

export const sidebar = style({
  gridArea: 'sidebar',
  display: 'none',
  background: 'none',
  borderRight: `1px solid ${vars.color.sidebarBorder}`,
  '@media': {
    [`(min-width: ${bp.tablet}px)`]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
});

export const content = style({
  gridArea: 'content',
  overflowY: 'auto',
  padding: '1.5rem',
});

export const bottomNav = style({
  gridArea: 'bottom-nav',
  background: vars.color.card,
  borderTop: `1px solid ${vars.color.border}`,
  '@media': {
    [`(min-width: ${bp.tablet}px)`]: {
      display: 'none',
    },
  },
});
