import { vars } from '../../styles/contract.css';
import type { Radius, UserThemePreference } from './types';

const RADIUS_MAP: Record<Radius, string> = {
  none: '0',
  sm: '0.375rem',
  md: '0.75rem',
  lg: '1.25rem',
};

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

let currentPrefs: UserThemePreference | null = null;

darkQuery.addEventListener('change', () => apply());

export function applyTheme(prefs: UserThemePreference): void {
  currentPrefs = prefs;
  apply();
}

/** Strips the `var(` / `)` wrapper VE puts on every contract leaf. */
function varName(cssVar: string): string {
  return cssVar.slice(4, -1);
}

function setOrRemove(cssVar: string, value: string | undefined): void {
  const prop = varName(cssVar);
  if (value) document.documentElement.style.setProperty(prop, value);
  else document.documentElement.style.removeProperty(prop);
}

function apply(): void {
  if (!currentPrefs) return;
  const slot = darkQuery.matches ? currentPrefs.dark : currentPrefs.light;

  // Slot overrides — only the 4 user-settable colors; everything else derives in CSS
  setOrRemove(vars.color.background, slot?.background);
  setOrRemove(vars.color.foreground, slot?.foreground);
  setOrRemove(vars.color.primary, slot?.primary);
  setOrRemove(vars.color.primaryForeground, slot?.primaryForeground);

  // Shared overrides
  setOrRemove(vars.font.family, currentPrefs.shared.fontFamily);
  const r = currentPrefs.shared.radius;
  setOrRemove(vars.layout.radius, r ? RADIUS_MAP[r] : undefined);
}
