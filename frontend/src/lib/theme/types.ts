import { Color } from 'chroma-js';

export interface SlotTheme {
  id: string;
  name: string;
  background: Color;
  primary: Color;
}

export const Radius = {
  none: 'none',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const;

export type Radius = (typeof Radius)[keyof typeof Radius];

export interface SharedTokens {
  fontFamily: string;
  radius: Radius;
}

export interface UserThemePreference {
  light: SlotTheme | null;
  dark: SlotTheme | null;
  shared: SharedTokens;
}
