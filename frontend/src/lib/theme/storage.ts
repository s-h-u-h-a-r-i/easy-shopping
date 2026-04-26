import { storage, STORAGE_KEY } from '../storage';
import { DEFAULT_THEME_PREFS } from './defaults';
import type { UserThemePreference } from './types';

export function loadThemePrefs(): UserThemePreference {
  return storage.get(STORAGE_KEY.ES_THEME) ?? DEFAULT_THEME_PREFS;
}

export function saveThemePrefs(prefs: UserThemePreference) {
  storage.set(STORAGE_KEY.ES_THEME, prefs);
}
