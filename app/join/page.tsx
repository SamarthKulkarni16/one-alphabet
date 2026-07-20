"use client";

import { useState } from "react";

export default function JoinPage() {
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState<"player" | "judge">("player");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Pass 2: POST to Supabase `signups` table.
    setSubmitted(true);
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <p className="font-data text-[13px] uppercase tracking-wider text-seal mb-4">
        Register
      </p>
      <h1 className="font-display text-5xl mb-6">Join the League</h1>
      <p className="text-ink-soft text-lg leading-relaxed mb-12">
        Everyone starts unranked, at the bottom of the alphabet leagues. No
        age restriction. No entry fee.
      </p>

      {submitted ? (
        <div className="border border-seal p-8">
          <p className="font-display text-2xl mb-2 text-seal">Registered.</p>
          <p className="text-ink-soft text-[15px]">
            You&rsquo;ll hear from us once the first open league forms in
            your region. Sign-ups aren&rsquo;t stored live yet &mdash; this
            form goes to the real database once accounts are wired up.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex gap-px bg-rule border border-rule w-fit">
            {(["player", "judge"] as const).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`font-data text-[13px] uppercase tracking-wider px-6 py-3 transition-colors ${
                  role === r
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink-soft hover:text-ink"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="font-data text-[12px] uppercase tracking-wider text-ink-soft">
              Full name
            </span>
            <input
              required
              type="text"
              className="w-full bg-transparent border-b border-rule py-3 mt-2 focus:border-seal outline-none"
            />
          </label>

          <label className="block">
            <span className="font-data text-[12px] uppercase tracking-wider text-ink-soft">
              Email
            </span>
            <input
              required
              type="email"
              className="w-full bg-transparent border-b border-rule py-3 mt-2 focus:border-seal outline-none"
            />
          </label>

          <label className="block">
            <span className="font-data text-[12px] uppercase tracking-wider text-ink-soft">
              Country
            </span>
            <input
              required
              type="text"
              className="w-full bg-transparent border-b border-rule py-3 mt-2 focus:border-seal outline-none"
            />
          </label>

          {role === "judge" && (
            <p className="font-data text-[12px] text-ink-soft border border-rule p-4">
              Note: entry into either flagship tournament as a player still
              requires 10 judged matches, regardless of your judging
              application here.
            </p>
          )}

          <button
            type="submit"
            className="font-data text-[13px] uppercase tracking-wider bg-ink text-paper px-8 py-4 hover:bg-seal transition-colors"
          >
            Register as {role}
          </button>
        </form>
      )}
    </div>
  );
}
