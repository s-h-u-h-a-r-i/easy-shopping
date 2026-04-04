-- Profiles (extends auth.users)
create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text,
    created_at timestampz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view and edit own profile" on public.profiles for all using (auth.uid () = id);

-- Shopping lists
create table public.shopping_lists (
    id uuid primary key default gen_random_uuid (),
    user_id uuid references public.profiles (id) on delete cascade not null,
);