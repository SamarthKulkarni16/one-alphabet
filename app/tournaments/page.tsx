import { getTournaments } from "@/lib/queries";

export const metadata = { title: "Tournaments | One Alphabet" };
export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  active: "text-seal border-seal",
  upcoming: "text-brass border-brass",
  completed: "text-ink-soft border-rule",
};

export default async function TournamentsPage() {
  const tournaments = await getTournaments();
  const flagship = tournaments.filter((t) => t.type !== "emergency");
  const emergency = tournaments.filter((t) => t.type === "emergency");

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="font-data text-[13px] uppercase tracking-wider text-seal mb-4">
        Compete
      </p>
      <h1 className="font-display text-5xl mb-16">Tournaments</h1>

      <section className="mb-20">
        <h2 className="font-display text-2xl mb-8">Flagship</h2>
        <div className="grid md:grid-cols-2 gap-px bg-rule border border-rule">
          {flagship.map((t) => (
            <div key={t.id} className="bg-paper p-8">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`font-data text-[11px] uppercase tracking-wider border px-2 py-1 ${statusColor[t.status]}`}
                >
                  {t.status}
                </span>
                <span className="font-data text-[11px] uppercase tracking-wider text-ink-soft">
                  {t.league}
                </span>
              </div>
              <h3 className="font-display text-2xl mb-3">{t.name}</h3>
              <p className="text-ink-soft text-[15px] leading-relaxed mb-4">
                {t.description}
              </p>
              <p className="font-data text-[12px] text-ink-soft">{t.dates}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-2">Emergency League</h2>
        <p className="text-ink-soft text-[15px] leading-relaxed mb-8 max-w-xl">
          Activated during major world events to preserve high-quality debate
          while the world is still deciding what it thinks.
        </p>
        <div className="border-t border-rule">
          {emergency.map((t) => (
            <div
              key={t.id}
              className="grid sm:grid-cols-[10rem_1fr_8rem] gap-4 items-start border-b border-rule py-6"
            >
              <span
                className={`font-data text-[11px] uppercase tracking-wider border px-2 py-1 w-fit h-fit ${statusColor[t.status]}`}
              >
                {t.status}
              </span>
              <div>
                <h3 className="font-display text-xl mb-1">{t.name}</h3>
                <p className="text-ink-soft text-[14px] leading-relaxed">
                  {t.description}
                </p>
              </div>
              <span className="font-data text-[12px] text-ink-soft sm:text-right">
                {t.dates}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
