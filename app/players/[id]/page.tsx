import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPlayerById,
  getRankHistoryForPlayer,
  getMatchesForPlayer,
  getPlayerLookup,
} from "@/lib/queries";
import TimeAtRank from "@/components/TimeAtRank";

export const dynamic = "force-dynamic";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();

  const [history, matches, playerLookup] = await Promise.all([
    getRankHistoryForPlayer(id),
    getMatchesForPlayer(id),
    getPlayerLookup(),
  ]);

  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <Link
        href="/rankings"
        className="font-data text-[12px] uppercase tracking-wider text-ink-soft hover:text-seal"
      >
        &larr; The Ladder
      </Link>

      <p className="font-data text-[13px] uppercase tracking-wider text-seal mt-6 mb-4">
        Player Profile
      </p>
      <h1 className="font-display text-5xl mb-6">{player.name}</h1>

      <div className="border border-rule p-8 mb-8">
        <div className="flex items-baseline gap-4 mb-2">
          <span className="font-display text-5xl text-seal">
            {player.rank}
          </span>
          <span className="font-data text-[13px] uppercase tracking-wider text-ink-soft">
            {player.league}
          </span>
        </div>
        <p className="font-data text-[12px] text-ink-soft mb-6">
          At this rank for <TimeAtRank since={player.rankSince} />
          {player.country && ` \u00b7 ${player.country}`}
        </p>
        <div className="grid grid-cols-2 gap-4 font-data text-[13px] text-ink-soft border-t border-rule pt-6">
          <div>
            <p className="text-ink text-lg">
              {player.wins}&ndash;{player.losses}
            </p>
            <p>win&ndash;loss</p>
          </div>
          <div>
            <p className="text-ink text-lg">{player.judgedMatches}</p>
            <p>judged</p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <p className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-4">
          Rank History
        </p>
        <div className="space-y-px bg-rule border border-rule">
          {history.map((h) => (
            <div
              key={h.id}
              className="bg-paper p-4 flex items-center justify-between"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-xl">{h.rank}</span>
                <span className="font-data text-[11px] text-ink-soft uppercase tracking-wider">
                  {h.league}
                </span>
              </div>
              <span className="font-data text-[12px] text-ink-soft">
                {h.endedAt ? (
                  <TimeAtRank since={h.startedAt} until={h.endedAt} />
                ) : (
                  <>
                    <TimeAtRank since={h.startedAt} /> &middot; current
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-4">
          Match History
        </p>
        {matches.length === 0 ? (
          <p className="text-ink-soft text-[15px]">No matches yet.</p>
        ) : (
          <div className="space-y-px bg-rule border border-rule">
            {matches.map((m) => {
              const isJudge = m.judgeId === player.id;
              const isReferee = m.refereeId === player.id;
              const opponentId =
                m.playerAId === player.id ? m.playerBId : m.playerAId;
              const opponent = playerLookup.get(opponentId);
              const wasWinner = m.winnerId === player.id;
              return (
                <div key={m.id} className="bg-paper p-5">
                  <p className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-1">
                    {new Date(m.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    &middot;{" "}
                    {isJudge
                      ? "Judged"
                      : isReferee
                      ? "Refereed"
                      : wasWinner
                      ? "Won"
                      : m.winnerId
                      ? "Lost"
                      : "Undecided"}
                  </p>
                  <p className="font-body text-[15px]">{m.topic}</p>
                  {!isJudge && !isReferee && opponent && (
                    <p className="font-data text-[12px] text-ink-soft mt-1">
                      vs {opponent.name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
