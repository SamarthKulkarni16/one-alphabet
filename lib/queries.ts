import { supabase, isSupabaseConfigured } from "./supabase";
import { Player, Match, Tournament } from "./types";
import {
  players as mockPlayers,
  matches as mockMatches,
  tournaments as mockTournaments,
} from "./data";

// Every function below tries Supabase first. If the project isn't
// configured yet, or a query fails for any reason, it quietly falls back
// to the seed data so the site never breaks mid-setup.

export async function getPlayers(): Promise<Player[]> {
  if (!isSupabaseConfigured || !supabase) return mockPlayers;
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("wins", { ascending: false });
  if (error || !data) return mockPlayers;
  return data.map(
    (p): Player => ({
      id: p.id,
      name: p.name,
      rank: p.rank,
      league: p.league,
      judgedMatches: p.judged_matches,
      wins: p.wins,
      losses: p.losses,
      joinedAt: p.joined_at,
      country: p.country,
      bio: p.bio ?? undefined,
    })
  );
}

export async function getMatches(): Promise<Match[]> {
  if (!isSupabaseConfigured || !supabase) return mockMatches;
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: false });
  if (error || !data) return mockMatches;
  return data.map(
    (m): Match => ({
      id: m.id,
      topic: m.topic,
      playerAId: m.player_a_id,
      playerBId: m.player_b_id,
      judgeId: m.judge_id,
      refereeId: m.referee_id,
      tournament: m.tournament_id,
      league: m.league,
      winnerId: m.winner_id,
      date: m.match_date,
      tags: m.tags ?? [],
      aiSummary: m.ai_summary ?? "",
      videoUrl: m.video_url ?? undefined,
      transcriptUrl: m.transcript_url ?? undefined,
    })
  );
}

export async function getTournaments(): Promise<Tournament[]> {
  if (!isSupabaseConfigured || !supabase) return mockTournaments;
  const { data, error } = await supabase.from("tournaments").select("*");
  if (error || !data) return mockTournaments;
  return data.map(
    (t): Tournament => ({
      id: t.id,
      name: t.name,
      type: t.type,
      league: t.league,
      status: t.status,
      dates: t.dates ?? "",
      description: t.description ?? "",
    })
  );
}

export async function getPlayerLookup(): Promise<Map<string, Player>> {
  const all = await getPlayers();
  return new Map(all.map((p) => [p.id, p]));
}

export async function sendMagicLink(
  email: string
): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message:
        "Sign-ups aren't connected to a live database yet — this will start sending real links once Supabase is wired up.",
    };
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo:
        typeof window !== "undefined" ? window.location.origin + "/join" : undefined,
    },
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Check your email for a sign-in link." };
}

export async function getMyPlayer(): Promise<Player | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", uid)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    rank: data.rank,
    league: data.league,
    judgedMatches: data.judged_matches,
    wins: data.wins,
    losses: data.losses,
    joinedAt: data.joined_at,
    country: data.country,
    bio: data.bio ?? undefined,
  };
}

export async function registerPlayer(input: {
  name: string;
  country: string;
  role: "player" | "judge";
  age?: number | null;
  gender?: string;
}): Promise<{ ok: boolean; message: string; rank?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, message: "Not connected to a live database yet." };
  }
  const { data, error } = await supabase.rpc("register_player", {
    p_name: input.name,
    p_country: input.country,
    p_role: input.role,
    p_age: input.age ?? null,
    p_gender: input.gender ?? null,
  });
  if (error || !data) {
    return {
      ok: false,
      message: error?.message ?? "Something went wrong. Try again in a moment.",
    };
  }
  return { ok: true, message: `Registered. You're ranked ${data.rank}.`, rank: data.rank };
}
