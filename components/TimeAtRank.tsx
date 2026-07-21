"use client";

import { useEffect, useState } from "react";

function formatElapsed(since: string): string {
  const start = new Date(since).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - start);
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function TimeAtRank({ since }: { since: string }) {
  const [elapsed, setElapsed] = useState(() => formatElapsed(since));

  useEffect(() => {
    const tick = () => setElapsed(formatElapsed(since));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [since]);

  return <span>{elapsed}</span>;
}
