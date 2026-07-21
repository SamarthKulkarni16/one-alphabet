"use client";

import { useEffect, useState } from "react";

function formatElapsed(sinceMs: number, untilMs: number): string {
  const diffMs = Math.max(0, untilMs - sinceMs);
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m`;
}

// If `until` is provided, shows a fixed historical duration.
// If omitted, ticks live from `since` to now (for a current rank).
export default function TimeAtRank({
  since,
  until,
}: {
  since: string;
  until?: string | null;
}) {
  const sinceMs = new Date(since).getTime();
  const fixedUntilMs = until ? new Date(until).getTime() : null;

  const [elapsed, setElapsed] = useState(() =>
    formatElapsed(sinceMs, fixedUntilMs ?? Date.now())
  );

  useEffect(() => {
    if (fixedUntilMs !== null) return; // static — no ticking needed
    const tick = () => setElapsed(formatElapsed(sinceMs, Date.now()));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [sinceMs, fixedUntilMs]);

  return <span>{elapsed}</span>;
}
