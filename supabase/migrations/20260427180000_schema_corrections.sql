-- ── 1. shopping_lists.status ─────────────────────────────────────────────────
-- Rename 'active' → 'idle' (a list that is not being shopped is just idle, not
-- "active" — "active" clashed conceptually with "shopping").
-- Remove 'completed' — the snapshot mechanism handles history; the list itself
-- reverts to idle when shopping ends.

alter table public.shopping_lists
  drop constraint shopping_lists_status_check;

update public.shopping_lists
  set status = 'idle'
  where status in ('active', 'completed');

alter table public.shopping_lists
  alter column status set default 'idle';

alter table public.shopping_lists
  add constraint shopping_lists_status_check
  check (status in ('idle', 'shopping'));

-- ── 2. list_items ─────────────────────────────────────────────────────────────
-- Drop unit: units are always part of the product name (e.g. "Oat milk 1L").
-- A separate unit column would require enforcing a fixed unit system and would
-- still produce nonsense values like "600 g of flour" when packages come in
-- fixed sizes.  Keeping it in the name is pragmatic and honest.

alter table public.list_items
  drop column unit;

-- Add is_skipped: lets users set items aside during a shopping trip without
-- removing them or marking them checked.  Skipped items are visible in a
-- collapsed "Set aside" section in the list detail view.

alter table public.list_items
  add column is_skipped boolean not null default false;

-- ── 3. snapshot_items ────────────────────────────────────────────────────────
-- Keep consistent with list_items: unit is part of product_name.

alter table public.snapshot_items
  drop column unit;
