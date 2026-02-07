-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  theme jsonb default '{"primaryColor": "#6366f1", "backgroundColor": "#0f0f0f", "fontFamily": "Inter"}'::jsonb,
  is_premium boolean default false,
  custom_domain text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Links table
create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  title text not null,
  url text not null,
  icon text default '🔗',
  position integer default 0,
  is_active boolean default true,
  click_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Social embeds table
create table public.social_embeds (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube', 'spotify', 'twitter')),
  embed_url text not null,
  position integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Analytics events table
create table public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles on delete cascade not null,
  link_id uuid references public.links on delete set null,
  event_type text not null check (event_type in ('page_view', 'link_click', 'social_click')),
  referrer text,
  country text,
  device_type text,
  browser text,
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_profiles_username on public.profiles(username);
create index idx_profiles_custom_domain on public.profiles(custom_domain);
create index idx_links_profile_id on public.links(profile_id);
create index idx_links_position on public.links(profile_id, position);
create index idx_social_embeds_profile_id on public.social_embeds(profile_id);
create index idx_analytics_profile_created on public.analytics_events(profile_id, created_at);
create index idx_analytics_link_id on public.analytics_events(link_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.social_embeds enable row level security;
alter table public.analytics_events enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Links policies
create policy "Public links are viewable by everyone"
  on public.links for select
  using (true);

create policy "Users can manage own links"
  on public.links for all
  using (auth.uid() = profile_id);

-- Social embeds policies
create policy "Public embeds are viewable by everyone"
  on public.social_embeds for select
  using (true);

create policy "Users can manage own embeds"
  on public.social_embeds for all
  using (auth.uid() = profile_id);

-- Analytics policies
create policy "Users can view own analytics"
  on public.analytics_events for select
  using (auth.uid() = profile_id);

create policy "Anyone can insert analytics"
  on public.analytics_events for insert
  with check (true);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    lower(replace(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), ' ', '')),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to increment click count
create or replace function public.increment_click_count(link_id uuid)
returns void as $$
begin
  update public.links
  set click_count = click_count + 1
  where id = link_id;
end;
$$ language plpgsql security definer;

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger links_updated_at
  before update on public.links
  for each row execute procedure public.update_updated_at();
