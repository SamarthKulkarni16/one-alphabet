import { getMatches, getPlayerLookup } from "@/lib/queries";

export const metadata = { title: "Archive | One Alphabet" };

export default async function ArchivePage() {
  const [matches, playerLookup] = await Promise.all([
    getMatches(),
    getPlayerLookup(),
  ]);
  const getPlayer = (id: string) => playerLookup.get(id);
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="font-data text-[13px] uppercase tracking-wider text-seal mb-4">
        The Record
      </p>
      <h1 className="font-display text-5xl mb-6">Archive</h1>
      <p className="text-ink-soft text-lg leading-relaxed mb-6 max-w-xl">
        Every official match, kept. Video, transcript, and an AI summary of
        how the argument actually turned.
      </p>

      <div className="mb-12">
        <input
          type="text"
          placeholder="Search by topic, player, or tag&hellip;"
          className="w-full max-w-md font-data text-sm bg-transparent border-b border-rule py-3 focus:border-seal outline-none placeholder:text-ink-soft"
          disabled
        />
        <p className="font-data text-[11px] text-ink-soft mt-2">
          Search activates once the archive connects to live data.
        </p>
      </div>

      <div className="space-y-px bg-rule border border-rule">
        {matches.length === 0 && (
          <div className="bg-paper p-8 text-center">
            <p className="text-ink-soft text-[15px]">
              No matches recorded yet — check back once the first official
              debates are played.
            </p>
          </div>
        )}
        {matches.map((m) => {
          const a = getPlayer(m.playerAId);
          const b = getPlayer(m.playerBId);
          const judge = getPlayer(m.judgeId);
          const winner = m.winnerId ? getPlayer(m.winnerId) : null;
          return (
            <div key={m.id} className="bg-paper p-8 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-2">
                    {m.tournament} &middot; {m.league}
                  </p>
                  <h2 className="font-display text-2xl max-w-xl">{m.topic}</h2>
                </div>
                <p className="font-data text-[12px] text-ink-soft whitespace-nowrap">
                  {new Date(m.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <p className="text-ink-soft text-[15px] leading-relaxed mb-5 max-w-2xl">
                {m.aiSummary}
              </p>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-5 font-data text-[12px] text-ink-soft">
                <span>
                  {a?.rank} {a?.name}
                  {winner?.id === a?.id && (
                    <span className="text-seal ml-1">&#9679; won</span>
                  )}
                </span>
                <span className="text-rule">vs</span>
                <span>
                  {b?.rank} {b?.name}
                  {winner?.id === b?.id && (
                    <span className="text-seal ml-1">&#9679; won</span>
                  )}
                </span>
                {!m.winnerId && (
                  <span className="text-ink-soft italic">undecided</span>
                )}
                <span>Judged by {judge?.name}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {m.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-data text-[11px] uppercase tracking-wider text-ink-soft border border-rule px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <span className="absolute top-6 right-8 font-display text-seal text-xs uppercase tracking-widest border border-seal rounded-full w-16 h-16 flex items-center justify-center rotate-12 opacity-70 select-none hidden md:flex">
                Case {m.id.replace("m", "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
