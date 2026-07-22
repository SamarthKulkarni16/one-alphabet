"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMyPlayer, getPlayerById, getMatchByBattleId } from "@/lib/queries";
import { getBattle, markBattleLive, subscribeToBattle, setBattleTopic } from "@/lib/battle";
import { triggerJudging } from "@/lib/judge";
import { Player, Battle } from "@/lib/types";
import TextBattle from "@/components/TextBattle";
import AudioBattle from "@/components/AudioBattle";
import VSCard, { VSCardStatus } from "@/components/VSCard";

function toVSCardStatus(status: Battle["status"]): VSCardStatus {
  if (status === "live") return "live";
  if (status === "completed" || status === "abandoned") return "completed";
  return "scheduled";
}

export default function BattleRoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Player | null>(null);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [topicDraft, setTopicDraft] = useState("");

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

  useEffect(() => {
    if (battle?.status !== "completed") return;
    getMatchByBattleId(battle.id).then((match) => {
      if (match) triggerJudging(match.id);
    });
  }, [battle?.status, battle?.id]);

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
      {opponent && (
        <div className="mb-10">
          <VSCard
            playerA={{ id: profile.id, name: profile.name, rank: profile.rank, league: profile.league }}
            playerB={{ id: opponent.id, name: opponent.name, rank: opponent.rank, league: opponent.league }}
            status={toVSCardStatus(battle.status)}
            topic={battle.topic}
          />
        </div>
      )}

      <div className={battle.status === "live" ? "" : "border border-rule p-8 mb-8"}>
        {battle.status === "waiting" && (
          <div>
            <p className="text-ink-soft text-[15px] mb-4">
              Both players need to confirm ready before this goes live.
              {battle.format === "text" && " Optionally set a topic first — either of you can."}
            </p>
            {battle.format === "text" && (
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={topicDraft}
                  onChange={(e) => setTopicDraft(e.target.value)}
                  placeholder={battle.topic ?? "e.g. Should remote work be the default?"}
                  className="flex-1 bg-transparent border-b border-rule py-2 focus:border-seal outline-none text-[15px]"
                />
                <button
                  onClick={() => {
                    if (topicDraft.trim()) setBattleTopic(battle.id, topicDraft.trim());
                  }}
                  className="font-data text-[12px] uppercase tracking-wider text-ink-soft hover:text-seal transition-colors"
                >
                  Set
                </button>
              </div>
            )}
            <button
              onClick={() => markBattleLive(battle.id)}
              className="font-data text-[13px] uppercase tracking-wider bg-ink text-paper px-8 py-4 hover:bg-seal transition-colors"
            >
              I&rsquo;m Ready
            </button>
          </div>
        )}
        {battle.status === "live" && battle.format === "text" && (
          <TextBattle battle={battle} profile={profile} opponent={opponent} />
        )}
        {battle.status === "live" && battle.format === "audio" && (
          <AudioBattle battle={battle} profile={profile} opponent={opponent} />
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
