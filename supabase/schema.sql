-- One Alphabet — Pass 2 schema
-- Reuses your existing Supabase project (same one as Flow Timer / Minima /
-- Daily Logs / Notes App). Everything lives in its own schema so it can't
-- collide with those apps' tables.

create schema if not exists one_alphabet;

create extension if not exists "pgcrypto";

create type one_alphabet.league_type as enum ('Alphabet League', 'Two Alphabet League', 'One Alphabet League');

-- ── Players ──
create table one_alphabet.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rank text not null,              -- 'A', 'B', ... 'AA', 'AB', ...
  league one_alphabet.league_type not null default 'Alphabet League',
  judged_matches int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  country text,
  bio text,
  user_id uuid references auth.users(id),
  joined_at timestamptz not null default now(),
  rank_since timestamptz not null default now()
);

create unique index players_user_id_unique
  on one_alphabet.players (user_id) where user_id is not null;

-- ── Tournaments ──
create table one_alphabet.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('promotion', 'flagship', 'emergency')),
  league text not null default 'Cross-League',
  status text not null check (status in ('upcoming', 'active', 'completed')),
  dates text,
  description text
);

-- ── Matches ──
create table one_alphabet.matches (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  player_a_id uuid references one_alphabet.players(id),
  player_b_id uuid references one_alphabet.players(id),
  judge_id uuid references one_alphabet.players(id),
  referee_id uuid references one_alphabet.players(id),
  tournament_id uuid references one_alphabet.tournaments(id),
  league one_alphabet.league_type not null,
  winner_id uuid references one_alphabet.players(id),
  match_date date not null default current_date,
  tags text[] not null default '{}',
  ai_summary text,
  video_url text,
  transcript_url text
);

-- ── Sign-ups (from the Join page) ──
create table one_alphabet.signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  role text not null check (role in ('player', 'judge')),
  country text,
  age int,
  gender text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

-- ── Row Level Security ──
alter table one_alphabet.players enable row level security;
alter table one_alphabet.tournaments enable row level security;
alter table one_alphabet.matches enable row level security;
alter table one_alphabet.signups enable row level security;

create policy "public read players" on one_alphabet.players for select using (true);
create policy "public read tournaments" on one_alphabet.tournaments for select using (true);
create policy "public read matches" on one_alphabet.matches for select using (true);

-- ── Expose this schema to the API ──
-- The anon/authenticated roles need USAGE on the schema itself, plus the
-- table-level grants below, on top of adding "one_alphabet" under
-- Project Settings → API → Data API Settings → Exposed schemas (dashboard
-- only, can't be done from SQL).
grant usage on schema one_alphabet to anon, authenticated;
grant select on one_alphabet.players, one_alphabet.tournaments, one_alphabet.matches to anon, authenticated;

-- ── Seed data (same as the mock data currently on the site) ──
insert into one_alphabet.tournaments (name, type, league, status, dates, description) values
  ('The Unknown Road to One Alphabet', 'promotion', 'Two Alphabet League', 'active', 'Rolling — online', 'Two Alphabet players challenge One Alphabet players for promotion into the elite league. Currently held online; physical qualification arrives once infrastructure allows it.'),
  ('Twilight Race to Get the Ace', 'flagship', 'One Alphabet League', 'upcoming', 'January 2027', 'One Alphabet League only. Players defend their standing and race to become A, the single highest-ranked player in the sport.'),
  ('Emergency League: AI Regulation', 'emergency', 'Cross-League', 'active', 'Opened July 2026', 'A temporary league activated to hold high-quality debate on the unfolding AI regulation landscape while it''s still being written.'),
  ('Emergency League: America–Iran', 'emergency', 'Cross-League', 'completed', 'Closed February 2026', 'Archived. Debates from this league remain searchable and form part of the permanent record.');

insert into one_alphabet.players (name, rank, league, judged_matches, wins, losses, country, bio) values
  ('Ines Adeyemi', 'A', 'One Alphabet League', 34, 41, 6, 'Nigeria', 'Reigning Ace. Known for reframing economic debates around lived experience rather than statistics.'),
  ('Kenji Watanabe', 'B', 'One Alphabet League', 22, 37, 9, 'Japan', null),
  ('Priya Menon', 'C', 'One Alphabet League', 18, 29, 11, 'India', null),
  ('Lucas Ferreira', 'D', 'One Alphabet League', 15, 25, 10, 'Brazil', null),
  ('Sara Haddad', 'AA', 'Two Alphabet League', 11, 20, 8, 'Jordan', null),
  ('Marcus Webb', 'AB', 'Two Alphabet League', 9, 18, 9, 'United Kingdom', null),
  ('Anya Sokolova', 'AC', 'Two Alphabet League', 7, 15, 10, 'Poland', null),
  ('Diego Ramirez', 'BA', 'Alphabet League', 2, 6, 4, 'Mexico', null);

-- ── Automatic rank assignment (see 002_rank_assignment.sql for the
-- standalone version — this is folded in here so a fresh setup gets it
-- in one pass) ──

create or replace function one_alphabet.rank_to_int(r text) returns bigint
language plpgsql immutable as $$
declare
  result bigint := 0;
begin
  for i in 1..length(r) loop
    result := result * 26 + (ascii(upper(substring(r from i for 1))) - ascii('A') + 1);
  end loop;
  return result;
end;
$$;

create or replace function one_alphabet.int_to_rank(n bigint) returns text
language plpgsql immutable as $$
declare
  result text := '';
  num bigint := n;
begin
  while num > 0 loop
    num := num - 1;
    result := chr((65 + (num % 26))::int) || result;
    num := num / 26;
  end loop;
  return result;
end;
$$;

create or replace function one_alphabet.next_rank() returns text
language plpgsql as $$
declare
  max_int bigint;
begin
  select coalesce(max(one_alphabet.rank_to_int(rank)), 0) into max_int from one_alphabet.players;
  return one_alphabet.int_to_rank(max_int + 1);
end;
$$;

alter table one_alphabet.players alter column rank drop not null;

create or replace function one_alphabet.assign_next_rank() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if new.rank is null then
      new.rank := one_alphabet.next_rank();
    end if;
    new.rank_since := now();
  elsif tg_op = 'UPDATE' then
    if new.rank is distinct from old.rank then
      new.rank_since := now();
    end if;
  end if;

  new.league := (case
    when length(new.rank) = 1 then 'One Alphabet League'
    when length(new.rank) = 2 then 'Two Alphabet League'
    else 'Alphabet League'
  end)::one_alphabet.league_type;

  return new;
end;
$$;

create trigger trg_assign_rank
  before insert or update of rank on one_alphabet.players
  for each row execute function one_alphabet.assign_next_rank();

-- Registration requires a verified Supabase Auth session (magic link).
-- The client can only ever pass name, country, role — rank, league,
-- wins/losses, and the verified email are always server-controlled.
-- Idempotent: calling it twice for the same signed-in user just returns
-- their existing row instead of creating a second one.
create or replace function one_alphabet.register_player(
  p_name text,
  p_country text,
  p_role text default 'player',
  p_age int default null,
  p_gender text default null
)
returns one_alphabet.players
language plpgsql
security definer
set search_path = one_alphabet
as $$
declare
  new_row one_alphabet.players;
  uid uuid := auth.uid();
  verified_email text := (auth.jwt() ->> 'email');
begin
  if uid is null then
    raise exception 'Must be signed in to register';
  end if;

  select * into new_row from one_alphabet.players where user_id = uid;
  if found then
    return new_row;
  end if;

  insert into one_alphabet.players (name, country, user_id)
  values (p_name, p_country, uid)
  returning * into new_row;

  insert into one_alphabet.signups (name, email, role, country, status, created_at, age, gender)
  values (p_name, coalesce(verified_email, 'unknown'), p_role, p_country, 'accepted', now(), p_age, p_gender);

  return new_row;
end;
$$;

revoke all on function one_alphabet.register_player(text, text, text, int, text) from public, anon;
grant execute on function one_alphabet.register_player(text, text, text, int, text) to authenticated;
