export type League =
  | "Alphabet League"
  | "Two Alphabet League"
  | "One Alphabet League";

export interface Player {
  id: string;
  name: string;
  rank: string; // e.g. "A", "B", "AC"
  league: League;
  judgedMatches: number;
  wins: number;
  losses: number;
  joinedAt: string;
  rankSince: string;
  country: string;
  bio?: string;
}

export interface RankHistoryEntry {
  id: string;
  playerId: string;
  playerName?: string;
  rank: string;
  league: League;
  startedAt: string;
  endedAt: string | null;
}

export interface Match {
  id: string;
  topic: string;
  playerAId: string;
  playerBId: string;
  judgeId: string;
  refereeId: string;
  tournament: string;
  league: League;
  winnerId: string | null;
  date: string;
  tags: string[];
  aiSummary: string;
  videoUrl?: string;
  transcriptUrl?: string;
}

export interface Tournament {
  id: string;
  name: string;
  type: "promotion" | "flagship" | "emergency";
  league: League | "Cross-League";
  status: "upcoming" | "active" | "completed";
  dates: string;
  description: string;
}
