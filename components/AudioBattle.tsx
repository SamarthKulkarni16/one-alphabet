"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { supabase } from "@/lib/supabase";
import { endBattle } from "@/lib/battle";
import { Battle, Player } from "@/lib/types";
import EndBattleControl from "@/components/EndBattleControl";

function formatClock(seconds: number): string {
  const m = Math.floor(Math.max(seconds, 0) / 60);
  const s = Math.max(seconds, 0) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioBattle({
  battle,
  profile,
  opponent,
}: {
  battle: Battle;
  profile: Player;
  opponent: Player | null;
}) {
  const [status, setStatus] = useState<"connecting" | "joined" | "error">("connecting");
  const [muted, setMuted] = useState(false);
  const [opponentPresent, setOpponentPresent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const callRef = useRef<DailyCall | null>(null);
  const endedRef = useRef(false);
  const recordingStartedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const { data } = await supabase!.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setStatus("error");
        setErrorMessage("Not signed in.");
        return;
      }

      const res = await fetch("/api/daily/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ battleId: battle.id }),
      });
      const room = await res.json();
      if (!res.ok || cancelled) {
        setStatus("error");
        setErrorMessage(room.error ?? "Could not create the call.");
        return;
      }

      const call = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: false,
      });
      callRef.current = call;

      call.on("joined-meeting", () => {
        if (!cancelled) setStatus("joined");
        // Whoever's client gets here first tries to start recording; if the
        // other beats them to it, Daily just no-ops the second call.
        if (!recordingStartedRef.current) {
          recordingStartedRef.current = true;
          call.startRecording();
        }
      });
      call.on("participant-joined", () => setOpponentPresent(true));
      call.on("participant-left", () => setOpponentPresent(false));
      call.on("error", (e: any) => {
        setStatus("error");
        setErrorMessage(e?.errorMsg ?? "Call error.");
      });

      await call.join({ url: room.roomUrl });
    }

    setup();

    return () => {
      cancelled = true;
      callRef.current?.leave();
      callRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle.id]);

  // Same countdown pattern as the text battle.
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

  function toggleMute() {
    const next = !muted;
    callRef.current?.setLocalAudio(!next);
    setMuted(next);
  }

  const lowTime = secondsLeft !== null && secondsLeft <= 30;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <p className="font-display text-xl">{battle.topic ?? "Open Debate"}</p>
        {secondsLeft !== null && (
          <p
            className={`font-data text-[13px] uppercase tracking-wider ${
              lowTime ? "text-seal" : "text-ink-soft"
            }`}
          >
            {formatClock(secondsLeft)}
          </p>
        )}
      </div>

      {status === "connecting" && (
        <p className="text-ink-soft text-[15px] mb-8">Connecting the call&hellip;</p>
      )}
      {status === "error" && (
        <p className="text-seal text-[15px] mb-8">{errorMessage}</p>
      )}

      {status === "joined" && (
        <div className="flex items-center gap-10 mb-10">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full border-2 border-ink flex items-center justify-center mx-auto mb-2 font-display text-2xl">
              {profile.name.charAt(0)}
            </div>
            <p className="font-data text-[11px] uppercase tracking-wider text-ink-soft">
              You {muted && "(muted)"}
            </p>
          </div>
          <div className="text-center">
            <div
              className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto mb-2 font-display text-2xl ${
                opponentPresent ? "border-seal" : "border-rule text-ink-soft"
              }`}
            >
              {opponent?.name.charAt(0) ?? "?"}
            </div>
            <p className="font-data text-[11px] uppercase tracking-wider text-ink-soft">
              {opponentPresent ? opponent?.name ?? "Opponent" : "Waiting to join\u2026"}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        {status === "joined" && (
          <button
            onClick={toggleMute}
            className="font-data text-[13px] uppercase tracking-wider border border-ink px-6 py-3 hover:bg-ink hover:text-paper transition-colors"
          >
            {muted ? "Unmute" : "Mute"}
          </button>
        )}
      </div>

      <EndBattleControl battle={battle} profile={profile} opponent={opponent} />
    </div>
  );
}
