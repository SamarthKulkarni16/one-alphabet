"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMatchById, getPlayerLookup } from "@/lib/queries";
import { Match, Player } from "@/lib/types";

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null | undefined>(undefined);
  const [playerLookup, setPlayerLookup] = useState<Map<string, Player>>(new Map());
  const [recordingLink, setRecordingLink] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (!id) return;
    Promise.all([getMatchById(id), getPlayerLookup()]).then(([m, lookup]) => {
      setMatch(m);
      setPlayerLookup(lookup);
    });
  }, [id]);

  async function loadRecording() {
    if (!match) return;
    setRecordingState("loading");
    try {
      const res = await fetch("/api/daily/recording-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecordingLink(data.downloadLink);
      setRecordingState("idle");
    } catch {
      setRecordingState("error");
    }
  }

  if (match === undefined) return null;
  if (match === null) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20">
        <p className="font-display text-2xl mb-4">Match not found.</p>
        <Link href="/archive" className="font-data text-[13px] uppercase tracking-wider text-seal hover:underline">
          &larr; Back to Archive
        </Link>
      </div>
    );
  }


  const a = playerLookup.get(match.playerAId);
  const b = playerLookup.get(match.playerBId);
  const judge = match.judgeId ? playerLookup.get(match.judgeId) : undefined;
  const winner = match.winnerId ? playerLookup.get(match.winnerId) : undefined;

  const transcriptLines = match.transcript
    ? match.transcript.split("\n").map((line) => {
        const idx = line.indexOf(": ");
        if (idx === -1) return { speaker: null, text: line };
        return { speaker: line.slice(0, idx), text: line.slice(idx + 2) };
      })
    : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link
        href="/archive"
        className="font-data text-[13px] uppercase tracking-wider text-seal hover:underline"
      >
        &larr; Archive
      </Link>

      <p className="font-data text-[12px] uppercase tracking-wider text-ink-soft mt-8 mb-2">
        {match.tournament ? `${match.tournament} \u00b7 ` : ""}
        {match.league}
        {" \u00b7 "}
        {new Date(match.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </p>
      <h1 className="font-display text-4xl mb-8">{match.topic}</h1>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-8 font-data text-[13px] text-ink-soft border-y border-rule py-5">
        <span>
          {a?.rank} {a?.name}
          {winner?.id === a?.id && <span className="text-seal ml-1">&#9679; won</span>}
        </span>
        <span className="text-rule">vs</span>
        <span>
          {b?.rank} {b?.name}
          {winner?.id === b?.id && <span className="text-seal ml-1">&#9679; won</span>}
        </span>
        {!match.winnerId && <span className="italic">undecided</span>}
        {judge && <span>Judged by {judge.name}</span>}
      </div>

      <p className="text-ink-soft text-[16px] leading-relaxed mb-10 max-w-2xl">
        {match.aiSummary || (
          <span className="italic">
            Awaiting AI judgment &mdash; the transcript below is the full,
            unedited record.
          </span>
        )}
      </p>

      {match.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {match.tags.map((tag) => (
            <span
              key={tag}
              className="font-data text-[11px] uppercase tracking-wider text-ink-soft border border-rule px-2 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {transcriptLines.length > 0 && (
        <div>
          <p className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-4">
            Transcript
          </p>
          <div className="border border-rule p-8 space-y-5">
            {transcriptLines.map((line, i) => (
              <div key={i}>
                {line.speaker && (
                  <p className="font-data text-[11px] uppercase tracking-wider text-ink-soft mb-1">
                    {line.speaker}
                  </p>
                )}
                <p className="text-[15px] leading-relaxed">{line.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {match.tags.includes("audio") && (
        <div>
          <p className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-4">
            Recording
          </p>
          {recordingLink ? (
            <audio controls src={recordingLink} className="w-full mb-2" />
          ) : (
            <button
              onClick={loadRecording}
              disabled={recordingState === "loading"}
              className="font-data text-[13px] uppercase tracking-wider bg-ink text-paper px-6 py-3 hover:bg-seal transition-colors disabled:opacity-40"
            >
              {recordingState === "loading" ? "Loading\u2026" : "Load Recording"}
            </button>
          )}
          {recordingState === "error" && (
            <p className="text-ink-soft text-[14px] italic mt-2">
              Recording isn&rsquo;t ready yet &mdash; Daily can take a minute
              or two to finish processing after the call ends. Try again shortly.
            </p>
          )}
        </div>
      )}

      {!match.transcript && !match.tags.includes("audio") && (
        <p className="text-ink-soft text-[15px] italic">
          No transcript recorded for this match yet.
        </p>
      )}
    </div>
  );
}
