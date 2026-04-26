import type { UserThemePreference } from './theme';

// #region Schema & Types

export const STORAGE_KEY = {
  ES_THEME: 'es:theme',
} as const;

export type StorageKey = (typeof STORAGE_KEY)[keyof typeof STORAGE_KEY];

export interface StorageSchema {
  [STORAGE_KEY.ES_THEME]: UserThemePreference;
}

// #endregion Schema & Types

//#region Operations

function get<K extends StorageKey>(key: K): StorageSchema[K] | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as StorageSchema[K];
  } catch {
    return null;
  }
}

function set<K extends StorageKey>(key: K, value: StorageSchema[K]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key: StorageKey): void {
  localStorage.removeItem(key);
}

export const storage = { get, set, remove };

// #endregion Operations
