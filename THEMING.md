# Theming System — easy-shopping

A user-controlled theming system that lets users personalise how the app looks. Users are not designers — the system must be powerful enough to be satisfying but simple enough to be approachable.

---

## Mental Model

There are always two mode **slots**: **light** and **dark**. The system preference (`prefers-color-scheme`) controls which slot is active — the app never overrides that. What users control is what each slot looks like.

Each slot can hold **color overrides** — a small set of user-settable colors. When a slot is `null` (not customised), the app uses the **built-in CSS defaults** for that mode. Once a user customises a slot, their values are saved and applied as inline styles on `:root`, overriding the CSS defaults. The other slot is unaffected.

This means a user can have a custom purple dark theme and the default light theme, or custom themes for both slots, or leave both at default.

---

## Implementation Architecture

### Single Source of Truth: `src/styles/contract.css.ts`

The theme contract is a **[Vanilla Extract](https://vanilla-extract.style/) `createThemeContract`** — a typed TypeScript object that defines every CSS custom property name used anywhere in the app. It has no values, only names:

```ts
export const vars = createThemeContract({
  color: { background: null, foreground: null, primary: null, ... },
  font:  { family: null, weightNormal: null, weightMedium: null },
  layout: { radius: null, sidebarWidth: null },
});
```

**This is the single source of truth for token names.** Everywhere that needs a token — component styles, global styles, `apply.ts` — imports `vars` and uses `vars.color.primary` etc. Renaming a token in the contract produces a TypeScript compile error at every usage site. A typo in a token name is impossible.

### Default Values: `src/styles/default.css.ts`

Default values for every token are set here via `globalStyle(':root', { vars: { ... } })`. Most values are static, but **derived tokens use CSS-native functions** so they update automatically when the user overrides a base color:

```ts
// card, border, muted derive from background at runtime — no JS needed
[vars.color.card]:   `oklch(from ${vars.color.background} calc(l - 0.015) c h)`,
[vars.color.border]: `color-mix(in oklch, ${vars.color.background}, ${vars.color.foreground} 12%)`,
[vars.color.muted]:  `color-mix(in oklch, ${vars.color.background}, ${vars.color.foreground} 8%)`,
```

The dark mode is a `@media (prefers-color-scheme: dark)` block inside the same file that overrides only `background`, `foreground`, `mutedForeground`, and `switchBackground`. The derived tokens cascade automatically.

### Component Styles

Every component has a co-located `.css.ts` file using Vanilla Extract's `style()` and `styleVariants()`. Tokens are referenced as typed TypeScript values — not strings:

```ts
// Button.css.ts
export const variantStyles = styleVariants({
  primary: {
    color: vars.color.primary,          // TypeScript-checked
    borderBottomColor: vars.color.primary,
  },
});
```

If `vars.color.primary` is renamed in the contract, this file breaks at compile time.

### User Overrides: `src/lib/theme/apply.ts`

At runtime, `applyTheme()` writes only the user-overridden values as inline styles on `document.documentElement`. Inline styles win over the `default.css.ts` stylesheet values. Properties with no user override are simply removed, falling back to the CSS defaults:

```ts
setOrRemove(vars.color.background, slot?.background);
setOrRemove(vars.color.primary,    slot?.primary);
// ... etc
```

`vars.color.background` here is typed — not a string literal. Rename the token and this breaks at compile time too. Since **only the base tokens** are user-settable, derived tokens (card, border, muted) update automatically in the browser via the CSS expressions in `default.css.ts`.

---

## Theme Data Model

```ts
// Only the user-settable per-slot overrides — everything else derives in CSS
interface SlotOverrides {
  background?: string;        // hex
  foreground?: string;        // hex
  primary?: string;           // hex
  primaryForeground?: string; // hex
}

// Shared across both slots — jarring if these changed with OS mode
interface SharedOverrides {
  fontFamily?: string;                     // e.g. "'Inter', system-ui, sans-serif"
  radius?: 'none' | 'sm' | 'md' | 'lg';  // 0 / 0.375rem / 0.75rem / 1.25rem
}

// The full stored preference
interface UserThemePreference {
  light: SlotOverrides | null; // null = use built-in CSS defaults
  dark:  SlotOverrides | null; // null = use built-in CSS defaults
  shared: SharedOverrides;
}
```

### Derived Tokens (CSS-native, not user-editable in Phase 1)

Every other CSS custom property derives automatically from `background` and `foreground` via CSS `color-mix()` and `oklch()` relative color syntax. No JavaScript derivation.

| CSS token            | Derives from                                         |
| -------------------- | ---------------------------------------------------- |
| `card`               | `oklch(from background ...)` — slightly lighter/darker |
| `border`             | `color-mix(background, foreground 12%)`              |
| `muted`              | `color-mix(background, foreground 8%)`               |
| `cardForeground`     | alias of `foreground`                                |
| `inputBackground`    | alias of `card`                                      |
| `ring`               | alias of `primary`                                   |
| `sidebarBorder`      | alias of `border`                                    |
| `destructive`        | fixed `#ef4444`                                      |

---

## Customisable Properties (Phase 1)

### Colors

Four pickers, clearly labelled:

- **Background** — "The canvas of the app. Dark backgrounds give a dark theme, light ones a light theme."
- **Foreground** — "Your main text colour."
- **Accent** — "Your primary colour — used for highlights, buttons, and focus states."
- **Accent text** — "Text colour on accent-coloured surfaces."

Each picker has a row of **preset swatches** for quick choices. The settings UI should suggest a sensible foreground/accent-text for the chosen background/accent (using luminance heuristics client-side), but the user's final choice is what's saved.

### Font

A select input with a curated list of ~10 Google Fonts chosen for readability at small sizes:

| Name           | Character                          |
| -------------- | ---------------------------------- |
| DM Sans        | Friendly, rounded (current default)|
| Inter          | Clean, neutral                     |
| Geist          | Modern, developer-feel             |
| Nunito         | Casual, approachable               |
| Lora           | Serif, editorial                   |
| Merriweather   | Serif, readable                    |
| JetBrains Mono | Monospace                          |
| Space Grotesk  | Geometric, distinctive             |

Fonts are loaded lazily via a `<link>` tag injected into `<head>` only when a non-default font is active.

### Border Radius

Four labelled options displayed as small visual previews:

- **Sharp** — `0`
- **Subtle** — `0.375rem`
- **Rounded** — `0.75rem` (default)
- **Pill** — `1.25rem`

> **Font size is not a theming option.** The browser already exposes a font size preference. The app must not override this — `html` carries no explicit `font-size`, so all `rem` values scale correctly with the user's browser setting.

---

## Persistence

### Phase 1 — localStorage

Both slots and shared settings are stored under `es:theme`:

```json
{
  "light": {
    "background": "#fdf6ff",
    "primary": "#a855f7"
  },
  "dark": null,
  "shared": {
    "fontFamily": "'Inter', system-ui, sans-serif",
    "radius": "md"
  }
}
```

`null` for a slot means "use the built-in CSS defaults for that mode."

On app load, `ThemeProvider` reads this key and calls `applyTheme()`, which writes only the overridden properties as inline styles on `:root`. The CSS defaults handle everything else. No flash of unstyled content — the CSS defaults are always present from the stylesheet.

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

Templates are static — they live in `src/lib/theme/templates.ts` as an array of `UserThemePreference` objects. Phase 1 ships without templates; the default CSS handles the "Default" appearance entirely.

---

## Settings Page UI

Lives at `/settings/appearance` (or a tab within a `/settings` page).

The page has two side-by-side (or stacked on mobile) sections — **Light Mode** and **Dark Mode** — each with its own set of controls. A small preview swatch next to each section header shows what that mode currently looks like.

**Within each mode section (Light / Dark):**

1. **Color section**
   - Background picker + preset swatches
   - Foreground picker (with smart suggestion based on background)
   - Accent picker + preset swatches
   - Accent text picker (with smart suggestion based on accent)
   - Live preview updates instantly
2. **Reset link** — "Reset to default" resets that slot only (the other slot is unaffected)

**Shared settings (below both sections) — affect both modes:**

3. **Font section** — font select + sample text that updates live
4. **Radius section** — four visual buttons: Sharp / Subtle / Rounded / Pill

No save button — changes apply live and auto-save to localStorage with a short debounce (~500ms).

---

## Implementation Phases

### Phase 1 (current scope)

- [x] `src/styles/contract.css.ts` — typed theme contract; single source of truth for all token names
- [x] `src/styles/default.css.ts` — all default values; derived tokens use `color-mix()` / `oklch()` for CSS-native auto-derivation
- [x] `src/styles/global.css.ts` — reset, typography, scrollbars
- [x] `src/lib/theme/types.ts` — `SlotOverrides`, `SharedOverrides`, `UserThemePreference`
- [x] `src/lib/theme/apply.ts` — writes user overrides as inline styles on `:root` using typed `vars` references
- [x] `ThemeProvider` + `useTheme` — reads stored theme on mount, applies it, exposes context for settings page
- [ ] Settings appearance page — color pickers, font select, radius picker, live preview, auto-save to localStorage
- [ ] Font loading — inject Google Fonts `<link>` on font change

### Phase 2 (after profiles + Supabase are wired up)

- [ ] `user_preferences` column or table in Supabase — stores the same `UserThemePreference` shape as JSON
- [ ] Load theme from DB on login, write to localStorage, apply immediately
- [ ] Save theme to DB on change (debounced, same 500ms)
- [ ] On logout: clear localStorage `es:theme`, restore both slots to built-in defaults

### Phase 3 (future)

- [ ] Bundled template library (`src/lib/theme/templates.ts`)
- [ ] Template browser in settings page
- [ ] More exposed tokens (destructive color, sidebar accent, etc.)
- [ ] Export/import theme as JSON
