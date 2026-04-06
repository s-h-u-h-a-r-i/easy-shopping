-- PROFILES
create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    username text not null unique check (username = lower(username)),
    display_name text,
    created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create unique index on public.profiles (lower(username));

-- PRODUCTS
create table public.products (
    id uuid primary key default gen_random_uuid (),
    barcode text not null unique,
    name text not null,
    brand text,
    category text,
    image_url text,
    created_at timestamptz default now()
);

alter table public.products enable row level security;

-- LIST GROUPS (personal, owned by one user)
create table public.list_groups (
    id uuid primary key default gen_random_uuid (),
    owner_id uuid not null references public.profiles (id) on delete cascade,
    name text not null,
    created_at timestamptz default now()
);

alter table public.list_groups enable row level security;

create index on public.list_groups (owner_id);

-- SHOPPING LISTS
create table public.shopping_lists (
    id uuid primary key default gen_random_uuid (),
    created_by uuid not null references public.profiles (id) on delete cascade,
    group_id uuid references public.list_groups (id) on delete set null,
    name text not null,
    status text not null default 'active' check (
        status in (
            'active',
            'shopping',
            'completed'
        )
    ),
    created_at timestamptz default now()
);

alter table public.shopping_lists enable row level security;

create index on public.shopping_lists (created_by);

create index on public.shopping_lists (group_id);

-- SHOPPING LIST MEMBERS
create table public.shopping_list_members (
    list_id uuid not null references public.shopping_lists (id) on delete cascade,
    user_id uuid not null references public.profiles (id) on delete cascade,
    role text not null check (
        role in ('owner', 'editor', 'viewer')
    ),
    joined_at timestamptz default now(),
    primary key (list_id, user_id)
);

alter table public.shopping_list_members enable row level security;

create index on public.shopping_list_members (user_id);

-- LIST INVITES
create table public.list_invites (
    id uuid primary key default gen_random_uuid (),
    list_id uuid not null references public.shopping_lists (id) on delete cascade,
    invited_by uuid not null references public.profiles (id) on delete cascade,
    invited_user_id uuid not null references public.profiles (id) on delete cascade,
    role text not null check (role in ('editor', 'viewer')),
    status text not null default 'pending' check (
        status in (
            'pending',
            'accepted',
            'declined'
        )
    ),
    created_at timestamptz default now(),
    unique (list_id, invited_user_id)
);

alter table public.list_invites enable row level security;

create index on public.list_invites (invited_user_id);

create index on public.list_invites (list_id);

-- LIST ITEMS
create table public.list_items (
    id uuid primary key default gen_random_uuid (),
    list_id uuid not null references public.shopping_lists (id) on delete cascade,
    product_id uuid not null references public.products (id),
    quantity numeric,
    unit text,
    checked boolean not null default false,
    created_at timestamptz default now()
);

alter table public.list_items enable row level security;

create index on public.list_items (list_id);

create index on public.list_items (product_id);

-- LIST SNAPSHOTS
create table public.list_snapshots (
    id uuid primary key default gen_random_uuid (),
    list_id uuid not null references public.shopping_lists (id) on delete cascade,
    created_by uuid not null references public.profiles (id) on delete cascade,
    created_at timestamptz default now()
);

alter table public.list_snapshots enable row level security;

create index on public.list_snapshots (list_id);

-- SNAPSHOT ITEMS (denormalized for historical integrity)
create table public.snapshot_items (
    id uuid primary key default gen_random_uuid (),
    snapshot_id uuid not null references public.list_snapshots (id) on delete cascade,
    product_id uuid references public.products (id) on delete set null,
    product_name text not null,
    product_brand text,
    product_category text,
    quantity numeric,
    unit text,
    checked boolean not null default false
);

alter table public.snapshot_items enable row level security;

create index on public.snapshot_items (snapshot_id);

-- AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();