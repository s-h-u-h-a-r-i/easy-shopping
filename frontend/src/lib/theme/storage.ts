import { storage, STORAGE_KEY } from '../storage';
import type { UserThemePreference } from './types';

const DEFAULT_PREFS: UserThemePreference = { light: null, dark: null, shared: {} };

export function loadThemePrefs(): UserThemePreference {
  return storage.get(STORAGE_KEY.ES_THEME) ?? DEFAULT_PREFS;
}

export function saveThemePrefs(prefs: UserThemePreference) {
  storage.set(STORAGE_KEY.ES_THEME, prefs);
}
