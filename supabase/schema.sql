-- One Alphabet — Pass 2 schema
-- Run this once, in a NEW Supabase project's SQL Editor (separate from your Android apps project).

create extension if not exists "pgcrypto";

-- ── Leagues are just a text constraint, not a table (keeps it simple to extend) ──
create type league_type as enum ('Alphabet League', 'Two Alphabet League', 'One Alphabet League');

-- ── Players ──
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rank text not null,              -- 'A', 'B', ... 'AA', 'AB', ...
  league league_type not null default 'Alphabet League',
  judged_matches int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  country text,
  bio text,
  joined_at timestamptz not null default now()
);

-- ── Tournaments ──
create table tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('promotion', 'flagship', 'emergency')),
  league text not null default 'Cross-League',
  status text not null check (status in ('upcoming', 'active', 'completed')),
  dates text,
  description text
);

-- ── Matches ──
create table matches (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  player_a_id uuid references players(id),
  player_b_id uuid references players(id),
  judge_id uuid references players(id),
  referee_id uuid references players(id),
  tournament_id uuid references tournaments(id),
  league league_type not null,
  winner_id uuid references players(id),
  match_date date not null default current_date,
  tags text[] not null default '{}',
  ai_summary text,
  video_url text,
  transcript_url text
);

-- ── Sign-ups (from the Join page) ──
create table signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  role text not null check (role in ('player', 'judge')),
  country text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

-- ── Row Level Security ──
alter table players enable row level security;
alter table tournaments enable row level security;
alter table matches enable row level security;
alter table signups enable row level security;

-- Public read on the sport's public data
create policy "public read players" on players for select using (true);
create policy "public read tournaments" on tournaments for select using (true);
create policy "public read matches" on matches for select using (true);

-- Signups: anyone can submit, nobody can read/edit from the client (admin only, via dashboard)
create policy "public can submit signups" on signups for insert with check (true);

-- ── Seed data (same as the mock data currently on the site) ──
insert into tournaments (name, type, league, status, dates, description) values
  ('The Unknown Road to One Alphabet', 'promotion', 'Two Alphabet League', 'active', 'Rolling — online', 'Two Alphabet players challenge One Alphabet players for promotion into the elite league. Currently held online; physical qualification arrives once infrastructure allows it.'),
  ('Twilight Race to Get the Ace', 'flagship', 'One Alphabet League', 'upcoming', 'January 2027', 'One Alphabet League only. Players defend their standing and race to become A, the single highest-ranked player in the sport.'),
  ('Emergency League: AI Regulation', 'emergency', 'Cross-League', 'active', 'Opened July 2026', 'A temporary league activated to hold high-quality debate on the unfolding AI regulation landscape while it''s still being written.'),
  ('Emergency League: America–Iran', 'emergency', 'Cross-League', 'completed', 'Closed February 2026', 'Archived. Debates from this league remain searchable and form part of the permanent record.');

insert into players (name, rank, league, judged_matches, wins, losses, country, bio) values
  ('Ines Adeyemi', 'A', 'One Alphabet League', 34, 41, 6, 'Nigeria', 'Reigning Ace. Known for reframing economic debates around lived experience rather than statistics.'),
  ('Kenji Watanabe', 'B', 'One Alphabet League', 22, 37, 9, 'Japan', null),
  ('Priya Menon', 'C', 'One Alphabet League', 18, 29, 11, 'India', null),
  ('Lucas Ferreira', 'D', 'One Alphabet League', 15, 25, 10, 'Brazil', null),
  ('Sara Haddad', 'AA', 'Two Alphabet League', 11, 20, 8, 'Jordan', null),
  ('Marcus Webb', 'AB', 'Two Alphabet League', 9, 18, 9, 'United Kingdom', null),
  ('Anya Sokolova', 'AC', 'Two Alphabet League', 7, 15, 10, 'Poland', null),
  ('Diego Ramirez', 'BA', 'Alphabet League', 2, 6, 4, 'Mexico', null);
