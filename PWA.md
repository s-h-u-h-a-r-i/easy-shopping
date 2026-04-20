# easy-shopping — PWA & Offline Strategy

## Goal

Make the app installable and keep the **active shopping list** usable when offline (spotty in-store mobile data). Everything else stays online-only. No sync engine, no complexity beyond what the use case demands.

---

## Two Separate Concerns

PWA and offline data are distinct problems solved at different layers:

| Concern | Layer | Tool |
| --- | --- | --- |
| App shell loads offline | Service Worker (Workbox) | `vite-plugin-pwa` |
| Shopping list data survives offline | Application layer (IndexedDB) | `idb-keyval` |

Intercepting Supabase API calls in the service worker is avoided — PostgREST query params are too complex to cache reliably. All data persistence stays in the app.

---

## What Works Offline

Only the **shopping mode** of an active list is supported offline:

- Viewing the list and its items
- Checking and unchecking items

Everything else is intentionally online-only and shows an offline banner if the user tries to access it without a connection:

- Auth / login
- Browsing, creating, or editing lists and groups
- Barcode scanning and product lookup
- Sharing and invites
- "Finish shopping" snapshot creation

---

## Layer 1 — PWA Shell (vite-plugin-pwa + Workbox)

**Purpose:** make the SPA installable and load-capable without a network.

### Configuration (vite.config.ts)

```ts
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Easy Shopping',
    short_name: 'Shopping',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    runtimeCaching: [
      {
        // Supabase REST calls — network-first, fall back to cache
        urlPattern: ({ url }) => url.origin === import.meta.env.VITE_SUPABASE_URL,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-cache',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
    ],
  },
})
```

### Required Assets

Place in `frontend/public/icons/`:
- `icon-192.png` — 192×192
- `icon-512.png` — 512×512 (also used as maskable)

---

## Layer 2 — Offline Shopping Mode (Application Layer)

### State Machine

Lists follow this status flow: `active → shopping → completed`

When a list enters **shopping** status:
1. The full list and its items are written to IndexedDB.
2. From that point on, reads come from IndexedDB (whether online or not).
3. Mutations (check/uncheck) are written to IndexedDB immediately, then either flushed to Supabase right away (if online) or queued for later sync.

On reconnect, the pending mutation queue is flushed.

### IndexedDB Schema (idb-keyval)

Two keys per list:

```ts
// snapshot of the list and its items at the time shopping started
`list:${listId}` → { list: ListSchema; items: ListItemSchema[] }

// ordered queue of pending mutations not yet synced
`list:${listId}:pending` → Array<PendingMutation>

type PendingMutation =
  | { type: 'check';   itemId: string; at: string } // ISO timestamp
  | { type: 'uncheck'; itemId: string; at: string }
```

### Hydration Flow

```
list enters "shopping" status
  → fetch list + items from Supabase
  → write to IndexedDB (list:${listId})
  → clear any stale pending mutations for this list
  → UI reads exclusively from IndexedDB going forward
```

### Mutation Flow

```
user checks/unchecks item
  → update IndexedDB immediately (optimistic)
  → if online: call Supabase, on success do nothing, on failure append to pending queue
  → if offline: append to pending queue only
```

### Sync-on-Reconnect Flow

```
online event fires (useOnlineStatus)
  → read pending queue for all active lists
  → Effect.forEach(mutations, syncMutation) with Effect.retry
  → on success: clear queue entry
  → on failure after retries: leave in queue, surface error to user
```

### File Location

```
src/features/shopping/
├── offlineStore.ts     ← idb-keyval wrapper; all IndexedDB reads/writes
├── syncQueue.ts        ← queue management + flush logic (Effect-based)
└── useOnlineStatus.ts  ← SolidJS signal wrapping navigator.onLine
```

---

## Online Status Primitive

```ts
// src/features/shopping/useOnlineStatus.ts
import { createSignal, onCleanup } from 'solid-js';

export function useOnlineStatus() {
  const [online, setOnline] = createSignal(navigator.onLine);
  const on = () => setOnline(true);
  const off = () => setOnline(false);
  window.addEventListener('online', on);
  window.addEventListener('offline', off);
  onCleanup(() => {
    window.removeEventListener('online', on);
    window.removeEventListener('offline', off);
  });
  return online;
}
```

---

## Offline Banner

A global fixed bar shown when offline and **not** in shopping mode:

> "You're offline — only your active shopping list is available."

In shopping mode, a subtler indicator (e.g. a muted "Offline" badge in the list header) is shown instead, since the experience still works.

---

## Effect Package Alignment

The sync queue maps naturally onto `effect`:

- `offlineStore.ts` — wrap `idb-keyval` calls in `Effect.tryPromise`
- `syncQueue.ts` — flush is `Effect.forEach` over pending mutations
- Retry on transient network failure: `Effect.retry(Schedule.exponential(...))`
- The queue flush is a fire-and-forget at the call site: `Effect.runPromise(flushQueue(listId))`

---

## Implementation Order

Do not build the offline layer before the online shopping feature exists.

1. **Now (scaffolding):** Steps 1–3 — PWA manifest, icons, register service worker. Cheap, gives installability immediately.
2. **When shopping list feature is built:** Steps 4–7 — `useOnlineStatus`, offline banner, `offlineStore`, sync queue wired into list mutations.
3. **Deferred:** Conflict resolution for concurrent edits (not needed until list sharing is active).

| Step | Task | When |
| --- | --- | --- |
| 1 | `bun add -D vite-plugin-pwa`, add to `vite.config.ts` | Now |
| 2 | Generate icons, add to `public/icons/` | Now |
| 3 | Verify SW registration and manifest in browser devtools | Now |
| 4 | `useOnlineStatus` signal | With shopping feature |
| 5 | `OfflineBanner` component | With shopping feature |
| 6 | `offlineStore.ts` — IndexedDB reads/writes | With shopping feature |
| 7 | `syncQueue.ts` — queue + flush + reconnect watcher | With shopping feature |
