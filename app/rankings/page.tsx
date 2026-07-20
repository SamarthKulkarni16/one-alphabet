import { getPlayers } from "@/lib/queries";
import { League } from "@/lib/types";

export const metadata = { title: "Rankings | One Alphabet" };

const leagueOrder: League[] = [
  "One Alphabet League",
  "Two Alphabet League",
  "Alphabet League",
];

function rankValue(rank: string) {
  // shorter rank strings and earlier letters rank higher; approximate sort
  if (rank.length !== 2) return rank.length * 100 + rank.charCodeAt(0);
  return 200 + (rank.charCodeAt(0) - 65) * 26 + (rank.charCodeAt(1) - 65);
}

export default async function RankingsPage() {
  const players = await getPlayers();
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="font-data text-[13px] uppercase tracking-wider text-seal mb-4">
        Public Ranking
      </p>
      <h1 className="font-display text-5xl mb-6">The Ladder</h1>
      <p className="text-ink-soft text-lg leading-relaxed mb-16 max-w-xl">
        A &rarr; B &rarr; C &hellip; Z &rarr; AA &rarr; AB &hellip; Rank climbs
        as letters shorten. One Alphabet Players sit at the top of the sport.
      </p>

      {leagueOrder.map((league) => {
        const rows = players
          .filter((p) => p.league === league)
          .sort((a, b) => rankValue(a.rank) - rankValue(b.rank));
        if (rows.length === 0) return null;
        return (
          <div key={league} className="mb-16">
            <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
              {league}
              {league === "One Alphabet League" && (
                <span className="font-data text-[11px] uppercase tracking-wider text-seal border border-seal px-2 py-1">
                  Elite
                </span>
              )}
            </h2>
            <div className="border-t border-rule">
              {rows.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[3.5rem_1fr_auto_auto] sm:grid-cols-[4rem_1fr_8rem_8rem_8rem] items-center gap-4 border-b border-rule py-4"
                >
                  <span
                    className={`font-display text-2xl ${
                      p.rank === "A" ? "text-seal" : "text-ink"
                    }`}
                  >
                    {p.rank}
                  </span>
                  <div>
                    <p className="font-body font-medium">{p.name}</p>
                    <p className="font-data text-[12px] text-ink-soft">
                      {p.country}
                    </p>
                  </div>
                  <span className="hidden sm:block font-data text-[12px] text-ink-soft">
                    {p.wins}W&ndash;{p.losses}L
                  </span>
                  <span className="hidden sm:block font-data text-[12px] text-ink-soft">
                    {p.judgedMatches} judged
                  </span>
                  <span className="font-data text-[12px] text-ink-soft text-right">
                    {p.judgedMatches >= 10 ? (
                      <span className="text-brass">flagship-eligible</span>
                    ) : (
                      `${10 - p.judgedMatches} to flagship`
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
