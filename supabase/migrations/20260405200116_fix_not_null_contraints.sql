alter table public.profiles alter column created_at set not null;

alter table public.products alter column created_at set not null;

alter table public.list_groups
alter column created_at
set
    not null;

alter table public.shopping_lists
alter column created_at
set
    not null;

alter table public.shopping_list_members
alter column joined_at
set
    not null;

alter table public.list_invites
alter column created_at
set
    not null;

alter table public.list_items alter column checked set not null;

alter table public.list_items alter column created_at set not null;

alter table public.list_snapshots
alter column created_at
set
    not null;