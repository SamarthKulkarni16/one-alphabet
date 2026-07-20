import Link from "next/link";
import AlphabetLadder from "@/components/AlphabetLadder";
import { matches, tournaments, players } from "@/lib/data";

export default function Home() {
  const featured = matches[0];
  const activeTournaments = tournaments.filter((t) => t.status === "active");
  const ace = players.find((p) => p.rank === "A");

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <p className="font-data text-[13px] uppercase tracking-wider text-seal mb-6">
            A Debate Sport &mdash; Est. 2026
          </p>
          <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.03] tracking-tight max-w-4xl">
            &ldquo;Wow&hellip; I never thought of it that way.&rdquo;
          </h1>
          <p className="mt-8 max-w-xl text-lg text-ink-soft leading-relaxed">
            That&rsquo;s the win condition. Not the loudest voice or the
            fastest talker &mdash; the argument that moves a judge, and the
            room, somewhere new. Ranked in letters, not numbers. Climb from
            the lower alphabet leagues toward becoming{" "}
            <span className="text-seal font-medium">A</span>.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/join"
              className="font-data text-[13px] uppercase tracking-wider bg-ink text-paper px-6 py-3 hover:bg-seal transition-colors"
            >
              Join the League
            </Link>
            <Link
              href="/constitution"
              className="font-data text-[13px] uppercase tracking-wider border border-ink px-6 py-3 hover:border-seal hover:text-seal transition-colors"
            >
              Read the Constitution
            </Link>
          </div>

          <div className="mt-16 pt-10 border-t border-rule">
            <p className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-4">
              The Climb
            </p>
            <AlphabetLadder />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-12">
        <div>
          <p className="font-data text-seal text-sm mb-3">10 min</p>
          <h3 className="font-display text-xl mb-2">One match, free-flowing</h3>
          <p className="text-ink-soft leading-relaxed text-[15px]">
            Two players, one judge, one referee. Players agree on the topic
            and who speaks first &mdash; if they can&rsquo;t, the referee
            decides, final.
          </p>
        </div>
        <div>
          <p className="font-data text-seal text-sm mb-3">Every match</p>
          <h3 className="font-display text-xl mb-2">Recorded, forever</h3>
          <p className="text-ink-soft leading-relaxed text-[15px]">
            Video, transcript, and AI summary, searchable by topic. One of
            the world&rsquo;s largest public libraries of human reasoning,
            built one debate at a time.
          </p>
        </div>
        <div>
          <p className="font-data text-seal text-sm mb-3">10 matches</p>
          <h3 className="font-display text-xl mb-2">Judge before you rank</h3>
          <p className="text-ink-soft leading-relaxed text-[15px]">
            To enter either flagship tournament, you must have judged at
            least 10 official matches. Perspective is earned from both
            sides of the table.
          </p>
        </div>
      </section>

      {/* Active tournaments */}
      <section className="border-t border-rule bg-paper-dim">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-display text-3xl">Active Tournaments</h2>
            <Link
              href="/tournaments"
              className="font-data text-[13px] uppercase tracking-wider text-ink-soft hover:text-seal"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-rule border border-rule">
            {activeTournaments.map((t) => (
              <div key={t.id} className="bg-paper p-8">
                <p className="font-data text-[12px] uppercase tracking-wider text-seal mb-3">
                  {t.league}
                </p>
                <h3 className="font-display text-2xl mb-3">{t.name}</h3>
                <p className="text-ink-soft text-[15px] leading-relaxed mb-4">
                  {t.description}
                </p>
                <p className="font-data text-[12px] text-ink-soft">
                  {t.dates}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured match / current Ace */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
          <p className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-4">
            From the Archive
          </p>
          <Link href="/archive" className="group block">
            <h3 className="font-display text-2xl mb-3 group-hover:text-seal transition-colors">
              {featured.topic}
            </h3>
            <p className="text-ink-soft text-[15px] leading-relaxed mb-4">
              {featured.aiSummary}
            </p>
            <div className="flex flex-wrap gap-2">
              {featured.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-data text-[11px] uppercase tracking-wider text-ink-soft border border-rule px-2 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        </div>
        <div className="md:col-span-2 border-l border-rule pl-12">
          <p className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-4">
            Current Ace
          </p>
          {ace && (
            <Link href="/rankings" className="group block">
              <p className="font-display text-4xl text-seal mb-1">
                {ace.rank}
              </p>
              <h3 className="font-display text-2xl group-hover:text-seal transition-colors mb-2">
                {ace.name}
              </h3>
              <p className="text-ink-soft text-[15px]">{ace.bio}</p>
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
