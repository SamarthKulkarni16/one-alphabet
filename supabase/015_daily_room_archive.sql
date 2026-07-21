-- The archive page is public, but battles is locked to participants. Audio
-- recordings live in Daily's cloud, looked up by room name — so the room
-- name needs to be copied onto the public matches row at archive time,
-- same as the transcript already is.

alter table one_alphabet.matches add column if not exists daily_room_name text;

create or replace function one_alphabet.complete_battle(battle_id uuid)
returns void
language plpgsql
security definer
set search_path = one_alphabet, public
as $$
declare
  b record;
  caller_player_id uuid;
  compiled_transcript text;
  a_league one_alphabet.league_type;
begin
  select id into caller_player_id from one_alphabet.players where user_id = auth.uid();

  select * into b from one_alphabet.battles where id = battle_id;

  if not found then
    raise exception 'battle not found';
  end if;

  if caller_player_id != b.player_a_id and caller_player_id != b.player_b_id then
    raise exception 'only a participant can end this battle';
  end if;

  if b.status = 'completed' then
    return;
  end if;

  if b.format = 'text' then
    select string_agg(p.name || ': ' || t.content, E'\n' order by t.created_at)
    into compiled_transcript
    from one_alphabet.battle_turns t
    join one_alphabet.players p on p.id = t.player_id
    where t.battle_id = b.id;
  end if;

  select league into a_league from one_alphabet.players where id = b.player_a_id;

  update one_alphabet.battles
  set status = 'completed',
      ended_at = now(),
      transcript = coalesce(compiled_transcript, transcript)
  where id = b.id;

  insert into one_alphabet.matches
    (topic, player_a_id, player_b_id, league, match_date, tags, transcript_url, video_url, transcript, daily_room_name)
  values
    (coalesce(b.topic, 'Open Debate'), b.player_a_id, b.player_b_id, a_league, current_date,
     array[b.format, 'live-battle'], null, b.recording_url, compiled_transcript, b.daily_room_name);
end;
$$;

grant execute on function one_alphabet.complete_battle(uuid) to authenticated;
