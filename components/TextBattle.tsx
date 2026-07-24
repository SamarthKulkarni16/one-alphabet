"use client";

import { useEffect, useRef, useState } from "react";
import { getTurns, sendTurn, subscribeToTurns, endBattle } from "@/lib/battle";
import { Battle, BattleTurn, Player } from "@/lib/types";
import EndBattleControl from "@/components/EndBattleControl";

function formatClock(seconds: number): string {
  const m = Math.floor(Math.max(seconds, 0) / 60);
  const s = Math.max(seconds, 0) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TextBattle({
  battle,
  profile,
  opponent,
}: {
  battle: Battle;
  profile: Player;
  opponent: Player | null;
}) {
  const [turns, setTurns] = useState<BattleTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const endedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTurns(battle.id).then(setTurns);
    const unsub = subscribeToTurns(battle.id, (turn) => {
      setTurns((prev) => (prev.some((t) => t.id === turn.id) ? prev : [...prev, turn]));
    });
    return unsub;
  }, [battle.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  // Countdown from battle.startedAt + duration_seconds. Whichever client's
  // clock hits zero first calls endBattle — complete_battle() is a no-op if
  // the other player's client gets there a beat later, so no race issue.
  useEffect(() => {
    if (!battle.startedAt) return;
    const startedAt = new Date(battle.startedAt).getTime();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = battle.durationSeconds - elapsed;
      setSecondsLeft(remaining);
      if (remaining <= 0 && !endedRef.current) {
        endedRef.current = true;
        endBattle(battle.id);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [battle.startedAt, battle.durationSeconds, battle.id]);

  async function handleSend() {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setDraft("");
    const res = await sendTurn(battle.id, profile.id, content);
    if (!res.ok) setDraft(content); // put it back so nothing's lost
    setSending(false);
  }

  const lowTime = secondsLeft !== null && secondsLeft <= 30;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-xl">
          {battle.topic ?? "Open Debate"}
        </p>
        {secondsLeft !== null && (
          <p
            className={`font-data text-[13px] uppercase tracking-wider ${
              lowTime ? "text-signal" : "text-steel"
            }`}
          >
            {formatClock(secondsLeft)}
          </p>
        )}
      </div>

      <div
        ref={scrollRef}
        className="border border-steel-line h-96 overflow-y-auto p-6 space-y-4 mb-4"
      >
        {turns.length === 0 && (
          <p className="text-steel text-[14px]">
            No messages yet &mdash; make the opening move.
          </p>
        )}
        {turns.map((t) => {
          const mine = t.playerId === profile.id;
          return (
            <div key={t.id} className={mine ? "text-right" : "text-left"}>
              <p className="font-data text-[11px] uppercase tracking-wider text-steel mb-1">
                {mine ? "You" : opponent?.name ?? "Opponent"}
              </p>
              <p
                className={`inline-block text-left text-[15px] leading-relaxed max-w-[80%] px-4 py-2 ${
                  mine ? "bg-bone text-void" : "bg-steel-line/20 text-bone"
                }`}
              >
                {t.content}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mb-6">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder=""
          rows={2}
          className="flex-1 bg-transparent border border-steel-line p-3 text-[15px] focus:border-signal outline-none resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          className="font-data text-[13px] uppercase tracking-wider bg-bone text-void px-6 hover:bg-signal transition-colors disabled:opacity-40"
        >
          Send
        </button>
      </div>

      <EndBattleControl battle={battle} profile={profile} opponent={opponent} />
    </div>
  );
}
