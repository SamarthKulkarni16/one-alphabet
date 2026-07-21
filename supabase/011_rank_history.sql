-- Adds a proper rank-history log: every rank a player has ever held, when
-- it started, and when it ended (null = current). This powers:
--   - "at this rank for Xh Ym" on profiles (already had this for current
--     rank only — now it also covers past ranks)
--   - public "search a rank, see who's held it and for how long"
--   - clickable player profiles from the Ladder

create table if not exists one_alphabet.rank_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references one_alphabet.players(id) on delete cascade,
  rank text not null,
  league one_alphabet.league_type not null,
  started_at timestamptz not null,
  ended_at timestamptz
);

create index if not exists rank_history_player_idx on one_alphabet.rank_history (player_id);
create index if not exists rank_history_rank_idx on one_alphabet.rank_history (rank);

alter table one_alphabet.rank_history enable row level security;
create policy "public read rank history" on one_alphabet.rank_history for select using (true);
grant select on one_alphabet.rank_history to anon, authenticated;

-- Log every rank change automatically. Runs AFTER the existing
-- assign_next_rank trigger has already finalized rank/league/rank_since.
create or replace function one_alphabet.record_rank_history() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    insert into one_alphabet.rank_history (player_id, rank, league, started_at)
    values (new.id, new.rank, new.league, new.rank_since);
  elsif tg_op = 'UPDATE' then
    if new.rank is distinct from old.rank then
      update one_alphabet.rank_history
      set ended_at = new.rank_since
      where player_id = new.id and ended_at is null;

      insert into one_alphabet.rank_history (player_id, rank, league, started_at)
      values (new.id, new.rank, new.league, new.rank_since);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_record_rank_history on one_alphabet.players;
create trigger trg_record_rank_history
  after insert or update of rank on one_alphabet.players
  for each row execute function one_alphabet.record_rank_history();

-- Backfill: give every existing player an open history row for their
-- current rank, so they show up in search/profile immediately.
insert into one_alphabet.rank_history (player_id, rank, league, started_at)
select id, rank, league, rank_since
from one_alphabet.players p
where not exists (
  select 1 from one_alphabet.rank_history rh where rh.player_id = p.id
);
