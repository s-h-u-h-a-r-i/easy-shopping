export const Radius = {
  none: 'none',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const;

export type Radius = (typeof Radius)[keyof typeof Radius];

export interface SlotOverrides {
  background?: string;
  foreground?: string;
  primary?: string;
  primaryForeground?: string;
}

export interface SharedOverrides {
  fontFamily?: string;
  radius?: Radius;
}

export interface UserThemePreference {
  light: SlotOverrides | null;
  dark: SlotOverrides | null;
  shared: SharedOverrides;
}
