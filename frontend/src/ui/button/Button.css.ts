import { globalStyle, style, styleVariants } from '@vanilla-extract/css';

import { spin } from '../../styles/animations.css';
import { vars } from '../../styles/contract.css';

export const button = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  border: 'none',
  borderBottom: '1px solid transparent',
  borderRadius: 0,
  background: 'none',
  fontWeight: vars.font.weightMedium,
  fontFamily: 'inherit',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  transition:
    'color 150ms ease, border-color 150ms ease, text-shadow 150ms ease, opacity 150ms ease',
  ':focus-visible': {
    outline: `2px solid ${vars.color.ring}`,
    outlineOffset: '2px',
  },
  ':disabled': {
    opacity: 0.4,
    pointerEvents: 'none',
  },
});

export const loadingState = style({
  opacity: 0.4,
  pointerEvents: 'none',
});

export const variantStyles = styleVariants({
  primary: {
    color: vars.color.primary,
    borderBottomColor: vars.color.primary,
    ':hover': {
      textShadow: `0 0 12px ${vars.color.primary}`,
    },
    '@media': {
      '(prefers-color-scheme: light)': {
        ':hover': { textShadow: 'none' },
      },
    },
  },
  secondary: {
    color: vars.color.foreground,
    borderBottomColor: vars.color.border,
    ':hover': {
      borderBottomColor: vars.color.foreground,
    },
  },
  ghost: {
    color: vars.color.mutedForeground,
    ':hover': {
      color: vars.color.foreground,
      borderBottomColor: vars.color.border,
    },
  },
  destructive: {
    color: vars.color.destructive,
    borderBottomColor: vars.color.destructive,
    ':hover': {
      textShadow: `0 0 12px ${vars.color.destructive}`,
    },
    '@media': {
      '(prefers-color-scheme: light)': {
        ':hover': { textShadow: 'none' },
      },
    },
  },
});

export const sizeStyles = styleVariants({
  sm: { height: '2rem', padding: '0 0.125rem', fontSize: '0.8125rem' },
  md: { height: '2.5rem', padding: '0 0.125rem', fontSize: '0.875rem' },
  lg: { height: '3rem', padding: '0 0.125rem', fontSize: '1rem' },
});

export const fullWidth = style({ width: '100%' });

export const icon = style({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  transition: 'filter 150ms ease',
});

export const label = style({ display: 'contents' });

export const spinner = style({
  width: '1em',
  height: '1em',
  flexShrink: 0,
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: `${spin} 0.6s linear infinite`,
});

// Parent→child icon effects — scoped via hashed class names
globalStyle(`${variantStyles.primary}:hover ${icon}`, {
  filter: `drop-shadow(0 0 8px ${vars.color.primary}) drop-shadow(0 0 3px ${vars.color.primary})`,
  '@media': {
    '(prefers-color-scheme: light)': { filter: 'none' },
  },
});

globalStyle(`${variantStyles.destructive}:hover ${icon}`, {
  filter: `drop-shadow(0 0 6px ${vars.color.destructive})`,
  '@media': {
    '(prefers-color-scheme: light)': { filter: 'none' },
  },
});
