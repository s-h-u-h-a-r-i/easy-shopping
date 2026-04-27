import { globalStyle } from '@vanilla-extract/css';

import { vars } from './contract.css';

// ─── Reset ────────────────────────────────────────────────────────────────────

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
});

// ─── Layout base ─────────────────────────────────────────────────────────────

globalStyle('*', {
  scrollbarColor: `${vars.color.border} transparent`,
});

globalStyle('html', {
  height: '100%',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

globalStyle('body', {
  minHeight: '100%',
  fontFamily: vars.font.family,
  fontWeight: vars.font.weightNormal,
  color: vars.color.foreground,
  background: vars.color.background,
  lineHeight: 1.5,
});

globalStyle('#root', {
  height: '100vh',
  overflow: 'hidden',
});

// ─── Typography ──────────────────────────────────────────────────────────────

globalStyle('h1, h2, h3, h4, h5, h6', {
  lineHeight: 1.1,
  fontWeight: vars.font.weightMedium,
});

globalStyle('button', {
  cursor: 'pointer',
  fontFamily: 'inherit',
});

globalStyle('input, textarea, select', {
  fontFamily: 'inherit',
});

// ─── Scrollbar ───────────────────────────────────────────────────────────────

globalStyle('::-webkit-scrollbar', {
  width: '6px',
  height: '6px',
});

globalStyle('::-webkit-scrollbar-track', {
  background: 'transparent',
});

globalStyle('::-webkit-scrollbar-thumb', {
  backgroundColor: vars.color.border,
  borderRadius: '999px',
});

globalStyle('::-webkit-scrollbar-thumb:hover', {
  backgroundColor: vars.color.mutedForeground,
});
