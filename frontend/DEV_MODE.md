# Frontend Dev / Mock Mode

A self-contained development overlay that lets you test layout, feel, and UI state transitions without real network calls. Activated by running the app with `VITE_MOCK=true`.

## Goals

- Test any UI state (loading, error, empty, populated) without a live backend
- Switch signed-in user instantly without going through auth flows
- Toggle network failure / slow network globally
- Zero impact on production code — all dev-mode code is statically dead-code eliminated by Vite

---

## Architecture Overview

```
Dev Panel (floating overlay, mock-mode only)
    │ writes to
    ▼
Dev mock store  (Solid store under src/dev/, mock-mode only)
    │ read by
    ▼
Mock Service Implementations  (src/features/<feature>/mock.ts)
    │ implement the same interface as
    ▼
Real Service Implementations  (src/features/<feature>/service.ts — unchanged)
    │ both consumed identically by
    ▼
Pages / Features  (never import mock or real directly)
```

Pages and features call services through a context-provided handle. In real mode they get the Supabase-backed service; in mock mode they get the mock. **The page code is identical either way.**

---

## Dev mock store

Implement as a Solid store exported from whichever module(s) under `src/dev/` fit your layout (alongside `DevPanel.tsx`, a dedicated store file, etc.).

A single Solid store holds all controllable dev state. Mock service implementations read from it reactively — changing a value in the dev panel propagates immediately without a page reload.

```ts
type MockUser = {
  id: string
  name: string
  email: string
}

type DevMockState = {
  auth: {
    user: MockUser | null  // null = signed out
  }
  network: 'success' | 'error' | 'slow'
  // extend as needed per feature, e.g.:
  // lists: 'populated' | 'empty' | 'many'
}
```

Create the store once and export it. Mock layers import it directly. Nothing outside `src/dev/` or `src/features/*/mock.ts` touches it.

---

## Service Layer — Mock Implementations

Each feature already has `service.ts` (real implementation). Add a sibling `mock.ts` that reads the dev mock store.

**Feature file structure (updated):**

```
src/features/<name>/
├── index.ts
├── models.ts
├── schemas.ts
├── repository.ts     ← real Supabase queries
├── service.ts        ← real business logic
└── mock.ts           ← mock implementation (reads dev mock store)
```

### Pattern for mock.ts

```ts
// mock.ts — reads dev mock store, returns Effect values
import { devMockStore } from '../../dev/your-mock-store-module'

export const mockShoppingListService = {
  getLists: () => {
    if (devMockStore.network === 'error')
      return Effect.fail(new NetworkError())

    if (devMockStore.network === 'slow')
      return Effect.succeed(mockLists).pipe(Effect.delay('2 seconds'))

    return Effect.succeed(mockLists)
  }
}
```

### Pattern for real service.ts

The real service doesn't need to change at all. It stays as-is.

---

## Auth Service

Auth state is part of the dev mock store (`devMockStore.auth.user`). The mock auth service reads from it directly. Switching the user in the dev panel = the entire app sees a new authenticated user instantly.

Define mock users next to the store export in the same `src/dev/` module:

```ts
export const MOCK_USERS: MockUser[] = [
  { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
  { id: 'user-2', name: 'Bob',   email: 'bob@example.com' },
]
```

---

## Wiring in index.tsx

`src/index.tsx` conditionally provides real or mock services based on `import.meta.env.VITE_MOCK`:

```ts
if (import.meta.env.VITE_MOCK) {
  // provide mock service context + render DevPanel
} else {
  // provide real service context (Supabase-backed)
}
```

Because this is a static `import.meta.env` check, Vite's tree-shaker eliminates the mock branch entirely in production builds. `src/dev/` and all `mock.ts` files do not ship.

---

## Dev Panel Component

`src/dev/DevPanel.tsx`

A floating overlay, rendered only in mock mode. Positioned in a corner so it doesn't interfere with layout testing.

**Controls:**

| Control | What it does |
|---|---|
| User dropdown | Switch between mock users or "Signed out" |
| Network select | `success / error / slow` — affects all service calls |
| Per-feature data selects | e.g. `populated / empty / many items` (add as needed) |

The panel writes the dev mock store. No other wiring needed — mock services react automatically.

---

## Activating Mock Mode

```bash
VITE_MOCK=true bun run dev
```

Add to `package.json` scripts for convenience:

```json
"dev:mock": "VITE_MOCK=true vite"
```

---

## Adding mock state fields

1. Extend the dev mock store type wherever you define it under `src/dev/`
2. Set a default value in the initial store
3. Add a control for it in `DevPanel.tsx`
4. Read the field in the relevant `mock.ts`

---

## Typing

Mock fixtures should be typed as the real schema types. If a real type changes, any fixture that no longer satisfies it produces a compile error — the mock is forced to update.

```ts
// src/dev/fixtures/lists.ts
import type { ShoppingList } from '../../features/lists/schemas'

export const mockLists: ShoppingList[] = [
  { id: '1', name: 'Groceries', status: 'idle' },
]
```

Sync is automatic: adding a required field to `ShoppingList` means updating the component that renders it, which means updating the fixture too. All three move together.

---

## What This Is Not

- Not MSW — there is no service worker intercepting HTTP. Mock data never touches the network layer.
- Not a test framework — this is for interactive development, not automated tests.
- Not a storybook replacement — it operates in the full app with routing, layout, and all real UI components. Use the existing `/ui` routes for isolated component testing.
