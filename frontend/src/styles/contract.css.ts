import { createThemeContract } from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: {
    background: null,
    foreground: null,
    card: null,
    cardForeground: null,
    primary: null,
    primaryForeground: null,
    muted: null,
    mutedForeground: null,
    border: null,
    inputBackground: null,
    ring: null,
    destructive: null,
    destructiveForeground: null,
    switchBackground: null,
    sidebarBorder: null,
  },
  font: {
    family: null,
    weightNormal: null,
    weightMedium: null,
  },
  layout: {
    radius: null,
    sidebarWidth: null,
  },
});
