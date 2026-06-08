-- Critiq database schema migrations
-- Migration 1: Initial schema with profiles, analyses, and storage
-- Run: supabase db push

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Stores user profile information
-- Synced from auth.users via trigger on signup

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================================
-- ANALYSES TABLE
-- ============================================================================
-- Stores design analysis results with AI-generated feedback

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  design_type text check (design_type in ('landing_page', 'mobile_app', 'dashboard', 'saas_product', null)),
  analysis jsonb not null, -- Contains: { overall_score, ux_score, visual_score, accessibility_score, conversion_score, summary, strengths, issues, recommendations }
  created_at timestamptz default now() not null
);

-- Indexes for common queries
create index if not exists analyses_user_id_idx on public.analyses(user_id);
create index if not exists analyses_created_at_idx on public.analyses(created_at desc);
create index if not exists analyses_design_type_idx on public.analyses(design_type);

-- Enable RLS
alter table public.analyses enable row level security;

-- Policies
drop policy if exists "Users can view own analyses" on public.analyses;
create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own analyses" on public.analyses;
create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own analyses" on public.analyses;
create policy "Users can delete own analyses"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-create profile on signup
-- Trigger ensures every auth user has a profile
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

-- Drop existing trigger if it exists to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- STORAGE CONFIGURATION
-- ============================================================================

-- Create designs bucket (for storing uploaded design images)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'designs',
  'designs',
  true,
  10485760, -- 10MB limit
  array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update set
  file_size_limit = 10485760,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']::text[];

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Allow authenticated users to upload images to their own folder
drop policy if exists "Authenticated users can upload designs" on storage.objects;
create policy "Authenticated users can upload designs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'designs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anyone to view designs (needed for Gemini API)
drop policy if exists "Anyone can view designs" on storage.objects;
create policy "Anyone can view designs"
  on storage.objects for select
  to public
  using (bucket_id = 'designs');

-- Allow users to update/delete their own designs
drop policy if exists "Users can update own designs" on storage.objects;
create policy "Users can update own designs"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'designs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own designs" on storage.objects;
create policy "Users can delete own designs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'designs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration sets up:
-- ✅ Profiles table with RLS
-- ✅ Analyses table with indexes and RLS
-- ✅ Auto-trigger for profile creation on signup
-- ✅ Storage bucket with policies
-- ✅ All security policies in place
