-- Create a users table that syncs with Clerk authentication
create table public.users (
  id text primary key, -- Clerk User ID
  email text not null,
  first_name text,
  last_name text,
  usage_count integer default 0 not null,
  study_streak integer default 1 not null,
  last_active_date date default CURRENT_DATE,
  tier text default 'free' not null, -- 'free', 'starter', 'pro', 'elite'
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create policy to allow users to view only their own data
create policy "Users can view own data" on public.users
  for select using (
    -- The Clerk JWT will inject the user's ID into the auth.jwt() claims as the "sub" (subject)
    auth.uid() = id
  );

-- Create policy to allow users to update their own data
create policy "Users can update own data" on public.users
  for update using (
    auth.uid() = id
  );

-- Create policy to allow authenticated users to insert their own row on first login
create policy "Users can insert own row" on public.users
  for insert with check (
    auth.uid() = id
  );
