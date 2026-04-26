import { BUILT_IN_DARK, BUILT_IN_LIGHT } from './defaults';
import { deriveTokens } from './derive';
import type { UserThemePreference } from './types';

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

let currentPrefs: UserThemePreference | null = null;

darkQuery.addEventListener('change', (e) => applySlot(e.matches));

export function applyTheme(prefs: UserThemePreference): void {
  currentPrefs = prefs;
  applySlot(darkQuery.matches);
}

function applySlot(isDark: boolean): void {
  if (!currentPrefs) return;
  const slot = isDark
    ? (currentPrefs.dark ?? BUILT_IN_DARK)
    : (currentPrefs.light ?? BUILT_IN_LIGHT);
  const tokens = deriveTokens(slot, currentPrefs.shared);
  const root = document.documentElement;
  for (const [k, v] of Object.entries(tokens)) {
    root.style.setProperty(k, v);
  }
}
