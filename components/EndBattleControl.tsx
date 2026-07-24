"use client";

import { useState } from "react";
import { requestEndBattle, cancelEndRequest } from "@/lib/battle";
import { Battle, Player } from "@/lib/types";

export default function EndBattleControl({
  battle,
  profile,
  opponent,
}: {
  battle: Battle;
  profile: Player;
  opponent: Player | null;
}) {
  const [busy, setBusy] = useState(false);

  const requestedByMe = battle.endRequestedBy === profile.id;
  const requestedByOpponent =
    battle.endRequestedBy !== null && battle.endRequestedBy !== profile.id;

  async function handleRequest() {
    setBusy(true);
    await requestEndBattle(battle.id);
    setBusy(false);
  }

  async function handleCancel() {
    setBusy(true);
    await cancelEndRequest(battle.id);
    setBusy(false);
  }

  if (requestedByOpponent) {
    return (
      <div className="border border-signal p-4">
        <p className="text-[14px] mb-3">
          {opponent?.name ?? "Your opponent"} wants to end the battle early.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleRequest}
            disabled={busy}
            className="font-data text-[12px] uppercase tracking-wider text-signal hover:underline disabled:opacity-40"
          >
            Agree &amp; End
          </button>
          <button
            onClick={handleCancel}
            disabled={busy}
            className="font-data text-[12px] uppercase tracking-wider text-steel hover:underline disabled:opacity-40"
          >
            Decline
          </button>
        </div>
      </div>
    );
  }

  if (requestedByMe) {
    return (
      <div>
        <p className="font-data text-[12px] uppercase tracking-wider text-steel mb-2">
          Waiting for {opponent?.name ?? "your opponent"} to confirm ending&hellip;
        </p>
        <button
          onClick={handleCancel}
          disabled={busy}
          className="font-data text-[12px] uppercase tracking-wider text-steel hover:text-signal transition-colors disabled:opacity-40"
        >
          Cancel Request
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={busy}
      className="font-data text-[12px] uppercase tracking-wider text-steel hover:text-signal transition-colors disabled:opacity-40"
    >
      End battle early
    </button>
  );
}
