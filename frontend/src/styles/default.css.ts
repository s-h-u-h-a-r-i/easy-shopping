import { globalStyle } from '@vanilla-extract/css';

import { vars } from './contract.css';

globalStyle(':root', {
  vars: {
    // Core surfaces — dark mode overrides these two, everything else derives from them
    [vars.color.background]: '#fafafa',
    [vars.color.foreground]: '#1a1a1a',

    // Card derives from background at build-and-runtime via CSS relative color
    [vars.color.card]: `oklch(from ${vars.color.background} calc(l - 0.015) c h)`,
    [vars.color.cardForeground]: vars.color.foreground,

    // Accent
    [vars.color.primary]: '#6366f1',
    [vars.color.primaryForeground]: '#ffffff',

    // Muted / border derive from bg+fg mix — update automatically when user overrides bg/fg
    [vars.color.muted]: `color-mix(in oklch, ${vars.color.background}, ${vars.color.foreground} 8%)`,
    [vars.color.mutedForeground]: '#737373',
    [vars.color.border]: `color-mix(in oklch, ${vars.color.background}, ${vars.color.foreground} 12%)`,

    // Aliases
    [vars.color.inputBackground]: vars.color.card,
    [vars.color.ring]: vars.color.primary,

    // Semantic
    [vars.color.destructive]: '#ef4444',
    [vars.color.destructiveForeground]: '#ffffff',
    [vars.color.switchBackground]: '#d4d4d4',
    [vars.color.sidebarBorder]: vars.color.border,

    // Typography
    [vars.font.family]: "'DM Sans', system-ui, -apple-system, sans-serif",
    [vars.font.weightNormal]: '400',
    [vars.font.weightMedium]: '500',

    // Layout
    [vars.layout.radius]: '0.75rem',
    [vars.layout.sidebarWidth]: '280px',
  },
});

// Dark mode: only background + foreground need to change.
// card, border, muted etc. derive automatically via the CSS expressions above.
globalStyle(':root', {
  '@media': {
    '(prefers-color-scheme: dark)': {
      vars: {
        [vars.color.background]: '#0a0a0a',
        [vars.color.foreground]: '#fafafa',
        [vars.color.mutedForeground]: '#a3a3a3',
        [vars.color.switchBackground]: '#525252',
      },
    },
  },
});
