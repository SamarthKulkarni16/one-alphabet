"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMyPlayer, getPlayerById } from "@/lib/queries";
import { getBattle, markBattleLive, endBattle, subscribeToBattle } from "@/lib/battle";
import { Player, Battle } from "@/lib/types";

export default function BattleRoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Player | null>(null);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPlayer().then(setProfile);
  }, []);

  useEffect(() => {
    if (!id) return;
    getBattle(id).then(async (b) => {
      setBattle(b);
      setLoading(false);
    });
    const unsub = subscribeToBattle(id, setBattle);
    return unsub;
  }, [id]);

  useEffect(() => {
    if (!battle || !profile) return;
    const opponentId =
      battle.playerAId === profile.id ? battle.playerBId : battle.playerAId;
    getPlayerById(opponentId).then(setOpponent);
  }, [battle, profile]);

  if (loading) return null;

  if (!battle || !profile) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20">
        <p className="font-display text-2xl mb-4">Battle not found.</p>
        <Link href="/battle" className="font-data text-[13px] uppercase tracking-wider text-seal hover:underline">
          &larr; Back to Battle
        </Link>
      </div>
    );
  }

  const isParticipant = battle.playerAId === profile.id || battle.playerBId === profile.id;
  if (!isParticipant) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20">
        <p className="font-display text-2xl">This isn&rsquo;t your battle.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <p className="font-data text-[13px] uppercase tracking-wider text-seal mb-4">
        {battle.format === "text" ? "Text Battle" : "Audio Battle"}
      </p>
      <h1 className="font-display text-4xl mb-2">
        You vs {opponent?.name ?? "\u2026"}
      </h1>
      <p className="font-data text-[12px] uppercase tracking-wider text-ink-soft mb-10">
        {battle.status}
      </p>

      <div className="border border-rule p-8 mb-8">
        {battle.status === "waiting" && (
          <div>
            <p className="text-ink-soft text-[15px] mb-6">
              Both players need to confirm ready before this goes live.
            </p>
            <button
              onClick={() => markBattleLive(battle.id)}
              className="font-data text-[13px] uppercase tracking-wider bg-ink text-paper px-8 py-4 hover:bg-seal transition-colors"
            >
              I&rsquo;m Ready
            </button>
          </div>
        )}
        {battle.status === "live" && (
          <div>
            <p className="font-display text-2xl mb-2">This battle is live.</p>
            <p className="text-ink-soft text-[15px] mb-6">
              The {battle.format} battle room itself is the next thing being
              built &mdash; this screen will become the live{" "}
              {battle.format === "text" ? "text exchange" : "audio call"}.
            </p>
            <button
              onClick={() => endBattle(battle.id)}
              className="font-data text-[13px] uppercase tracking-wider border border-ink px-6 py-3 hover:bg-ink hover:text-paper transition-colors"
            >
              End Battle
            </button>
          </div>
        )}
        {battle.status === "completed" && (
          <div>
            <p className="font-display text-2xl mb-2">Battle ended.</p>
            <Link
              href="/battle"
              className="font-data text-[13px] uppercase tracking-wider text-seal hover:underline"
            >
              Find another opponent &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
