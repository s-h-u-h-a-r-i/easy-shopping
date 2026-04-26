import {
  Accessor,
  createContext,
  createMemo,
  createSignal,
  onMount,
  ParentComponent,
  useContext,
} from 'solid-js';

import { applyTheme } from './apply';
import { DEFAULT_SHARED } from './defaults';
import { loadThemePrefs, saveThemePrefs } from './storage';
import { SharedTokens, SlotTheme, UserThemePreference } from './types';

type ThemeContextValue = {
  prefs: Accessor<UserThemePreference>;
  update: (prefs: UserThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue>();

export const ThemeProvider: ParentComponent = (props) => {
  const [light, setLight] = createSignal<SlotTheme | null>(null);
  const [dark, setDark] = createSignal<SlotTheme | null>(null);
  const [shared, setShared] = createSignal<SharedTokens>(DEFAULT_SHARED);

  const prefs = createMemo<UserThemePreference>(() => ({
    light: light(),
    dark: dark(),
    shared: shared(),
  }));

  function update(next: UserThemePreference) {
    setLight(next.light);
    setDark(next.dark);
    setShared(next.shared);
    applyTheme(next);
    saveThemePrefs(next);
  }

  onMount(() => {
    const stored = loadThemePrefs();
    setLight(stored.light);
    setDark(stored.dark);
    setShared(stored.shared);
    applyTheme(stored);
  });

  return (
    <ThemeContext.Provider value={{ prefs, update }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
