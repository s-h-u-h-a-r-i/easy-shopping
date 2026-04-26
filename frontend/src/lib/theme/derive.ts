import chroma from 'chroma-js';
import { Radius, SharedTokens, SlotTheme } from './types';

const RADIUS_MAP: Record<Radius, string> = {
  none: '0',
  sm: '0.375rem',
  md: '0.75rem',
  lg: '1.25rem',
};

export function deriveTokens(slot: SlotTheme, shared: SharedTokens) {
  const bg = chroma(slot.background);
  const pri = chroma(slot.primary);
  const isDark = bg.luminance() < 0.179; // perceptual threshold

  const fg = isDark ? '#fafafa' : '#1a1a1a';
  const card = bg.brighten(isDark ? 0.25 : -0.03).hex();
  const border = chroma.mix(bg, fg, isDark ? 0.12 : 0.1, 'rgb').hex();
  const muted = chroma.mix(bg, fg, isDark ? 0.1 : 0.06, 'rgb').hex();
  const mutedFg = isDark ? '#a3a3a3' : '#737373';
  const sidebar = bg.darken(isDark ? 0.2 : 0).hex();
  const switchBg = isDark ? '#525252' : '#d4d4d4';
  const priFg = pri.luminance() > 0.179 ? '#1a1a1a' : '#ffffff';

  return {
    /* Typography */
    '--font-family': shared.fontFamily,
    '--font-weight-medium': '500',
    '--font-weight-normal': '400',

    /* Radius & layout */
    '--radius': RADIUS_MAP[shared.radius],
    '--sidebar-width': '280px',

    /* Core surfaces */
    '--background': chroma(slot.background).hex(),
    '--foreground': fg,
    '--card': card,
    '--card-foreground': fg,
    '--popover': card,
    '--popover-foreground': fg,

    /* Accent colors */
    '--primary': chroma(slot.primary).hex(),
    '--primary-foreground': priFg,
    '--secondary': muted,
    '--secondary-foreground': fg,
    '--muted': muted,
    '--muted-foreground': mutedFg,
    '--accent': muted,
    '--accent-foreground': fg,
    '--destructive': '#ef4444',
    '--destructive-foreground': '#ffffff',

    /* Borders & inputs */
    '--border': border,
    '--input': 'transparent',
    '--input-background': card,
    '--ring': chroma(slot.primary).hex(),

    /* Switches */
    '--switch-background': switchBg,

    /* Sidebar */
    '--sidebar': sidebar,
    '--sidebar-foreground': fg,
    '--sidebar-primary': chroma(slot.primary).hex(),
    '--sidebar-primary-foreground': priFg,
    '--sidebar-accent': muted,
    '--sidebar-accent-foreground': fg,
    '--sidebar-border': border,
    '--sidebar-ring': chroma(slot.primary).hex(),
  };
}
