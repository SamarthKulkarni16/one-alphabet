"use client";

import { useState } from "react";
import Link from "next/link";
import { searchByRank } from "@/lib/queries";
import { RankHistoryEntry } from "@/lib/types";
import TimeAtRank from "@/components/TimeAtRank";

export default function HistoryPage() {
  const [rank, setRank] = useState("");
  const [results, setResults] = useState<RankHistoryEntry[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = rank.trim().toUpperCase();
    if (!query) return;
    setSearching(true);
    const res = await searchByRank(query);
    setResults(res);
    setSearched(query);
    setSearching(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <p className="font-data text-[13px] uppercase tracking-wider text-signal mb-4">
        Search
      </p>
      <h1 className="font-display text-5xl mb-6">Who&rsquo;s Held a Rank</h1>
      <p className="text-steel text-lg leading-relaxed mb-12 max-w-lg">
        Every rank has a history. Search a letter &mdash; A, B, AA, whatever
        &mdash; and see everyone who&rsquo;s held it, in order, with how
        long each stay lasted.
      </p>

      <form onSubmit={handleSearch} className="flex gap-4 mb-12">
        <input
          type="text"
          value={rank}
          onChange={(e) => setRank(e.target.value)}
          placeholder="e.g. A"
          maxLength={4}
          className="w-32 bg-transparent border-b border-steel-line py-3 font-display text-2xl uppercase focus:border-signal outline-none"
        />
        <button
          type="submit"
          disabled={searching}
          className="font-data text-[13px] uppercase tracking-wider bg-bone text-void px-6 py-3 hover:bg-signal transition-colors disabled:opacity-50"
        >
          {searching ? "Searching\u2026" : "Search"}
        </button>
      </form>

      {results !== null && (
        <div>
          <p className="font-data text-[12px] uppercase tracking-wider text-steel mb-4">
            Rank {searched} &mdash; {results.length}{" "}
            {results.length === 1 ? "holder" : "holders"}
          </p>
          {results.length === 0 ? (
            <p className="text-steel text-[15px]">
              Nobody has held rank {searched} yet.
            </p>
          ) : (
            <div className="space-y-px bg-steel-line border border-steel-line">
              {results.map((h) => (
                <Link
                  href={`/players/${h.playerId}`}
                  key={h.id}
                  className="bg-void p-5 flex items-center justify-between hover:bg-steel-line transition-colors"
                >
                  <div>
                    <p className="font-body font-medium">{h.playerName}</p>
                    <p className="font-data text-[11px] text-steel uppercase tracking-wider">
                      {h.league}
                    </p>
                  </div>
                  <span className="font-data text-[12px] text-steel text-right">
                    {h.endedAt ? (
                      <TimeAtRank since={h.startedAt} until={h.endedAt} />
                    ) : (
                      <>
                        <TimeAtRank since={h.startedAt} /> &middot; current
                      </>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
