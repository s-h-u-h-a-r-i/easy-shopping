create policy "Users can read own profile" on public.profiles for
select using (auth.uid () = id);