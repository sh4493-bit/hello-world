create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create table if not exists public.caption_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt text not null check (char_length(btrim(prompt)) between 8 and 500),
  caption text not null check (char_length(btrim(caption)) between 1 and 280),
  created_at timestamptz not null default now()
);

create index if not exists caption_generations_created_at_idx
  on public.caption_generations (created_at desc);

alter table public.caption_generations enable row level security;
revoke all on table public.caption_generations from anon, authenticated;
grant select, insert on table public.caption_generations to authenticated;

drop policy if exists "Captions are publicly readable" on public.caption_generations;
drop policy if exists "Members can read their own captions" on public.caption_generations;
create policy "Members can read their own captions"
  on public.caption_generations for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Members can create their own captions" on public.caption_generations;
create policy "Members can create their own captions"
  on public.caption_generations for insert to authenticated
  with check (user_id = (select auth.uid()));

create or replace view public.caption_feed
with (security_invoker = false)
as
  select id, prompt, caption, created_at
  from public.caption_generations;

grant select on public.caption_feed to anon, authenticated;

create table if not exists public.caption_votes (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.caption_generations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  value text not null check (value in ('up', 'down')),
  created_at timestamptz not null default now(),
  unique (generation_id, user_id)
);

create index if not exists caption_votes_generation_id_idx
  on public.caption_votes (generation_id);

alter table public.caption_votes enable row level security;
revoke all on table public.caption_votes from anon, authenticated;
grant select, insert on table public.caption_votes to authenticated;

drop policy if exists "Caption votes are publicly readable" on public.caption_votes;
drop policy if exists "Members can read their own caption votes" on public.caption_votes;
create policy "Members can read their own caption votes"
  on public.caption_votes for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Members can cast their own caption votes" on public.caption_votes;
create policy "Members can cast their own caption votes"
  on public.caption_votes for insert to authenticated
  with check (user_id = (select auth.uid()));

create or replace view public.caption_vote_totals
with (security_invoker = false)
as
  select
    generation_id,
    count(*) filter (where value = 'up') as up_votes,
    count(*) filter (where value = 'down') as down_votes
  from public.caption_votes
  group by generation_id;

grant select on public.caption_vote_totals to anon, authenticated;

alter table public.genai enable row level security;
revoke insert, update, delete, truncate, references, trigger on table public.genai from anon, authenticated;
grant select on table public.genai to anon, authenticated;

drop policy if exists "Palette colors are publicly readable" on public.genai;
create policy "Palette colors are publicly readable"
  on public.genai for select to anon, authenticated
  using (true);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'given_name', new.raw_user_meta_data ->> 'first_name'),
    coalesce(new.raw_user_meta_data ->> 'family_name', new.raw_user_meta_data ->> 'last_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

insert into public.profiles (id, first_name, last_name)
select
  id,
  coalesce(raw_user_meta_data ->> 'given_name', raw_user_meta_data ->> 'first_name'),
  coalesce(raw_user_meta_data ->> 'family_name', raw_user_meta_data ->> 'last_name')
from auth.users
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);