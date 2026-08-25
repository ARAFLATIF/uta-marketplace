-- ============================================================
-- UTA Marketplace — schema, RLS policies, and email-domain lock
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- 1. LISTINGS TABLE
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric(10,2) not null default 0,
  category text default 'other',
  image_url text,
  status text not null default 'active', -- 'active' | 'sold'
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "Anyone signed in can view listings"
  on public.listings for select
  to authenticated
  using (true);

create policy "Users can insert their own listings"
  on public.listings for insert
  to authenticated
  with check (auth.uid() = seller_id);

create policy "Users can update their own listings"
  on public.listings for update
  to authenticated
  using (auth.uid() = seller_id);

create policy "Users can delete their own listings"
  on public.listings for delete
  to authenticated
  using (auth.uid() = seller_id);

-- 2. MESSAGES TABLE (one thread per listing per buyer)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users can view messages they sent or received"
  on public.messages for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = sender_id);

-- 3. PROFILES TABLE (display name, populated on signup)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Anyone signed in can view profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 4. DOMAIN LOCK: only @mavs.uta.edu may create an account
-- This runs BEFORE insert on auth.users, so it blocks signup at the
-- database level even if someone bypasses your frontend checks.
create or replace function public.enforce_uta_email()
returns trigger as $$
begin
  if new.email !~* '^[a-zA-Z0-9._%+-]+@mavs\.uta\.edu$' then
    raise exception 'Only @mavs.uta.edu email addresses may register';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists enforce_uta_email_trigger on auth.users;
create trigger enforce_uta_email_trigger
  before insert on auth.users
  for each row execute function public.enforce_uta_email();

-- 5. Auto-create a profile row whenever a user successfully signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. STORAGE: bucket for listing photos (run once)
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Anyone signed in can upload listing images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-images');

create policy "Anyone can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- 7. Enable realtime updates for chat (so new messages appear live)
alter publication supabase_realtime add table public.messages;
