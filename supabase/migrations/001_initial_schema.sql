-- Critiq initial schema
-- Run this in Supabase SQL Editor or via CLI: supabase db push

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Analyses table
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  design_type text,
  analysis jsonb not null,
  created_at timestamptz default now() not null
);

create index if not exists analyses_user_id_idx on public.analyses(user_id);
create index if not exists analyses_created_at_idx on public.analyses(created_at desc);

alter table public.analyses enable row level security;

create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket for design screenshots
insert into storage.buckets (id, name, public)
values ('designs', 'designs', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Authenticated users can upload designs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'designs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view designs"
  on storage.objects for select
  to public
  using (bucket_id = 'designs');

create policy "Users can update own designs"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'designs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own designs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'designs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
