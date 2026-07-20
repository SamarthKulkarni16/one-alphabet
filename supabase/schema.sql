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
  joined_at timestamptz not null default now()
);

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
create policy "public can submit signups" on one_alphabet.signups for insert with check (true);

-- ── Expose this schema to the API ──
-- The anon/authenticated roles need USAGE on the schema itself, plus the
-- table-level grants below, on top of adding "one_alphabet" under
-- Project Settings → API → Data API Settings → Exposed schemas (dashboard
-- only, can't be done from SQL).
grant usage on schema one_alphabet to anon, authenticated;
grant select on one_alphabet.players, one_alphabet.tournaments, one_alphabet.matches to anon, authenticated;
grant insert on one_alphabet.signups to anon, authenticated;

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
