import chroma from 'chroma-js';

import { Radius, SharedTokens, SlotTheme, UserThemePreference } from './types';

export const BUILT_IN_LIGHT: SlotTheme = {
  id: 'default-light',
  name: 'Default Light',
  background: chroma('#fafafa'),
  primary: chroma('#6366f1'),
};

export const BUILT_IN_DARK: SlotTheme = {
  id: 'default-dark',
  name: 'Default Dark',
  background: chroma('#0a0a0a'),
  primary: chroma('#6366f1'),
};

export const DEFAULT_SHARED: SharedTokens = {
  fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
  radius: Radius.md,
};

export const DEFAULT_THEME_PREFS: UserThemePreference = {
  light: null,
  dark: null,
  shared: DEFAULT_SHARED,
} as const;
