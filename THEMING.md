# Theming System — easy-shopping

A user-controlled theming system that lets users personalise how the app looks. Users are not designers — the system must be powerful enough to be satisfying but simple enough to be approachable.

---

## Mental Model

There are always two mode **slots**: **light** and **dark**. The system preference (`prefers-color-scheme`) controls which slot is active — the app never overrides that. What users control is what each slot looks like.

Each slot holds a **theme** — a complete set of visual tokens (colors, font, shape). When a slot is `null` (not customised), the app uses the **built-in default** for that mode. Once a user customises a slot, their theme is saved and used instead. The other slot is unaffected.

This means a user can have a custom purple dark theme and the default light theme, or custom themes for both slots, or leave both at default.

### Where the Default Theme Lives

The built-in defaults are defined in two places that must stay in sync:

1. **`_theme.scss`** — CSS custom properties for the initial paint (before any JS runs). This is the no-JS fallback.
2. **`src/lib/theme/defaults.ts`** — the same values as TypeScript constants. The inline script and `ThemeProvider` use these when a slot is `null`, so the derived token logic always has a complete input to work from.

In practice, once the inline script runs (which is nearly immediately), the `<style id="es-theme">` tag it writes replaces the stylesheet values entirely — `_theme.scss` is only ever seen on the very first frame.

---

## Theme Data Model

```ts
// Per-slot: only the color tokens differ between light and dark
interface SlotTheme {
  id: string; // "default" | nanoid for user-created themes
  name: string; // user-given name, e.g. "My Purple Dark"
  background: string; // hex — drives all surface colors
  primary: string; // hex — accent, ring, glow, buttons
}

// Shared across both slots — jarring if these changed with OS mode
interface SharedTokens {
  fontFamily: string; // e.g. "Inter"
  radius: 'none' | 'sm' | 'md' | 'lg'; // 0 / 0.375rem / 0.75rem / 1.25rem
}

// The full stored preference
interface UserThemePreferences {
  light: SlotTheme | null; // null = use built-in light theme
  dark: SlotTheme | null; // null = use built-in dark theme
  shared: SharedTokens; // always present; falls back to defaults if missing
}
```

### Derived Tokens (not user-editable in Phase 1)

Every other CSS custom property is **derived automatically** from `background` and `primary` at theme-apply time via a JS utility:

| CSS variable         | Derives from                                                              |
| -------------------- | ------------------------------------------------------------------------- |
| `--foreground`       | contrast colour against `--background` (dark bg → light text, vice versa) |
| `--card`             | `--background` lightened/darkened slightly                                |
| `--border`           | `--background` shifted toward mid-grey                                    |
| `--muted`            | `--background` shifted, low contrast                                      |
| `--muted-foreground` | mid-contrast against `--background`                                       |
| `--ring`             | `--primary`                                                               |
| `--sidebar`          | `--background` slightly offset                                            |
| `--destructive`      | fixed red; only hue-shifted slightly if it clashes badly with `--primary` |

The derivation logic lives in `src/lib/theme/derive.ts` and produces a full `Record<string, string>` that gets written to `:root` as inline CSS variables.

---

## Customisable Properties (Phase 1)

### Colors

Two pickers, clearly labelled:

- **Background** — "The canvas of the app. Dark backgrounds give a dark theme, light ones give a light theme."
- **Accent** — "Your primary colour — used for highlights, buttons, and focus states."

Both use a standard hex color picker. A row of **preset swatches** sits above the picker for quick choices.

### Font

A select input with a curated list of ~10 Google Fonts chosen for readability at small sizes:

| Name           | Character                        |
| -------------- | -------------------------------- |
| Inter          | Clean, neutral (current default) |
| Geist          | Modern, developer-feel           |
| DM Sans        | Friendly, rounded                |
| Nunito         | Casual, approachable             |
| Lora           | Serif, editorial                 |
| Merriweather   | Serif, readable                  |
| JetBrains Mono | Monospace                        |
| Space Grotesk  | Geometric, distinctive           |

Plus a text input: "Or enter a Google Fonts name" — the app will attempt to load it. If it fails to load, it falls back to the previous font silently.

Fonts are loaded lazily via a `<link>` tag injected into `<head>` only when a non-default font is active.

### Border Radius

Four labelled options displayed as small visual previews (rounded rectangles):

- **Sharp** — `0` (current default for interactive elements; `0` for cards too)
- **Subtle** — `0.375rem`
- **Rounded** — `0.75rem` (current card default)
- **Pill** — `1.25rem`

Maps to `--radius`. Interactive elements (`button`, `input`) that currently have `border-radius: 0` explicitly will **not** change — `--radius` only affects structural containers like cards, modals, and sheets.

---

## Persistence

### Phase 1 — localStorage

Both slots are stored in `localStorage` under the key `es:theme`:

```json
{
  "light": {
    "id": "usr_abc123",
    "name": "My Light Theme",
    "background": "#fdf6ff",
    "primary": "#a855f7"
  },
  "dark": null,
  "shared": {
    "fontFamily": "DM Sans",
    "radius": "rounded"
  }
}
```

`null` for a slot means "use the built-in default for that mode." In the example above, the user has a custom light theme but their dark mode is still the default.

On app load, the inline script reads this key and derives + writes two sets of CSS tokens:

```html
<style id="es-theme">
  :root {
    /* derived light theme tokens */
  }
  @media (prefers-color-scheme: dark) {
    :root {
      /* derived dark theme tokens */
    }
  }
</style>
```

This runs before the app bundle so there is no flash of unstyled content. The system preference continues to control which set is active — the user never touches that.

### Phase 2 — Supabase (deferred)

Once `profiles` is wired up, the active theme is saved to a `user_preferences` table (or a `theme` column on `profiles`). On login the DB value takes precedence over localStorage. On logout the DB value is cleared from localStorage and the default system theme is restored.

```sql
-- proposed column on profiles (Phase 2)
theme jsonb default null  -- null = use default system theme
```

---

## Templates (Future)

A **template** is a pre-built, named theme that ships with the app. Users can:

1. Browse templates in the settings page
2. Apply a template as-is
3. Apply a template and then customise it (it becomes their own theme)

Templates are static — they live in `src/lib/theme/templates.ts` as an array of `Theme` objects. The "Default" entry (`id: "default"`) is special — it means "follow the system."

Phase 1 ships with only the "Default" template (the current hardcoded light/dark pair). Future templates can be added without any schema changes.

---

## CSS Application

Rather than writing to `:root` inline styles (which can't express media queries), the theme is applied by replacing the content of a `<style id="es-theme">` tag injected into `<head>`.

The tag **always** emits a complete token set for both modes. When a slot is `null`, the built-in defaults from `defaults.ts` are used in its place. This avoids a subtle bug where a bare `:root { }` block (with no media query) would override the dark mode values too.

```ts
function applyTheme(prefs: UserThemePreferences): void {
  const lightSlot = prefs.light ?? BUILT_IN_LIGHT;
  const darkSlot = prefs.dark ?? BUILT_IN_DARK;

  const lightVars = toCssVars(deriveTokens(lightSlot, prefs.shared));
  const darkVars = toCssVars(deriveTokens(darkSlot, prefs.shared));

  const css = `
    @media (prefers-color-scheme: light) { :root { ${lightVars} } }
    @media (prefers-color-scheme: dark)  { :root { ${darkVars}  } }
  `;

  let el = document.getElementById('es-theme') as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = 'es-theme';
    document.head.appendChild(el);
  }
  el.textContent = css;
}
```

`_theme.scss` is the **no-JS fallback** only — seen on the very first frame before the inline script runs. Once the `<style id="es-theme">` tag is written it takes precedence via source order, and `_theme.scss` is effectively superseded.

**No flash (deferred):** The inline script approach is deferred until the app-wide loading screen is implemented. The loading screen will cover first paint entirely, making the inline script unnecessary — theme application becomes just another step in the initialization sequence, alongside auth and data prefetching. Until then, `ThemeProvider` applies the theme on mount; a brief flash on cold load is acceptable.

---

## Settings Page UI

Lives at `/settings/appearance` (or a tab within a `/settings` page).

The page has two side-by-side (or stacked on mobile) sections — **Light Mode** and **Dark Mode** — each with its own set of controls. A small preview swatch next to each section header shows what that mode currently looks like.

**Within each mode section (Light / Dark):**

1. **Theme name input** — auto-generates a name ("My Light Theme") when first customised; user can rename
2. **Color section**
   - Background picker + preset swatches
   - Accent picker + preset swatches
   - Live preview updates instantly
3. **Reset link** — "Reset to default" resets that slot only (the other slot is unaffected)

**Shared settings (below both sections) — affect both modes:**

4. **Font section** — font select + custom font input; sample text updates live
5. **Radius section** — four visual buttons: Sharp / Subtle / Rounded / Pill

Font and radius are shared because it would be jarring for these to change when the OS switches between light and dark.

> **Font size is not a theming option.** The browser already exposes a font size preference (Settings → Appearance → Font size). The app must not override this — `html` should carry no explicit `font-size`, so all `rem` values scale correctly with the user's browser setting.

No save button — changes apply live and auto-save to localStorage with a short debounce (~500ms).

---

## Implementation Phases

### Phase 1 (current scope)

- [x] `src/lib/theme/defaults.ts` — built-in light + dark token constants (mirrors `_theme.scss`)
- [x] `src/lib/theme/derive.ts` — derive full CSS variable map from a `SlotTheme` + `SharedTokens`
- [x] `src/lib/theme/apply.ts` — applies tokens as inline styles on `:root` via `matchMedia`
- [ ] ~~Inline theme-restore script in `index.html`~~ — deferred; will be part of the app loading screen
- [x] `ThemeProvider` component — reads stored theme on mount, applies it, exposes context for settings page
- [ ] Settings appearance page — color pickers, font select, radius picker, live preview, auto-save to localStorage
- [ ] Font loading — inject Google Fonts `<link>` on font change

### Phase 2 (after profiles + Supabase are wired up)

- [ ] `user_preferences` column or table in Supabase — stores the same `{ light, dark }` shape as JSON
- [ ] Load theme from DB on login, write to localStorage, apply immediately
- [ ] Save theme to DB on change (debounced, same 500ms)
- [ ] On logout: clear localStorage `es:theme`, restore both slots to built-in defaults

### Phase 3 (future)

- [ ] Bundled template library (`src/lib/theme/templates.ts`)
- [ ] Template browser in settings page
- [ ] More exposed tokens (destructive color, foreground override, sidebar accent, etc.)
- [ ] Export/import theme as JSON
