const rungs = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "AA", "AB", "AC", "AD",
  "BA", "BB", "BC",
];

export default function AlphabetLadder({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`font-data flex flex-wrap gap-x-3 gap-y-2 ${
        compact ? "text-sm" : "text-base sm:text-lg"
      }`}
      aria-hidden="true"
    >
      {rungs.map((r, i) => {
        const isOne = i < 10;
        const isTwo = i >= 10 && i < 14;
        return (
          <span
            key={r}
            className={
              isOne
                ? "text-seal font-medium"
                : isTwo
                ? "text-brass"
                : "text-ink-soft"
            }
          >
            {r}
            {i < rungs.length - 1 && (
              <span className="text-rule mx-1.5">&rarr;</span>
            )}
          </span>
        );
      })}
      <span className="text-ink-soft">&hellip;</span>
    </div>
  );
}
