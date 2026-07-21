"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendMagicLink, registerPlayer } from "@/lib/queries";

export default function JoinPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Step 1: email → magic link
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [linkMessage, setLinkMessage] = useState("");
  const [sendingLink, setSendingLink] = useState(false);

  // Step 2: registration, once signed in
  const [role, setRole] = useState<"player" | "judge">("player");
  const [registering, setRegistering] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setCheckingSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setSendingLink(true);
    const res = await sendMagicLink(email);
    setLinkMessage(res.message);
    setLinkSent(res.ok);
    setSendingLink(false);
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegistering(true);
    const form = new FormData(e.currentTarget);
    const res = await registerPlayer({
      name: String(form.get("name") ?? ""),
      country: String(form.get("country") ?? ""),
      role,
    });
    setResult(res);
    setRegistering(false);
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setResult(null);
    setLinkSent(false);
    setLinkMessage("");
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <p className="font-data text-[13px] uppercase tracking-wider text-seal mb-4">
        Register
      </p>
      <h1 className="font-display text-5xl mb-6">Join the League</h1>
      <p className="text-ink-soft text-lg leading-relaxed mb-12">
        Everyone starts unranked, at the bottom of the alphabet leagues. No
        entry fee. One verified email, one rank.
      </p>

      {checkingSession ? null : result?.ok ? (
        <div className="border border-seal p-8">
          <p className="font-display text-2xl mb-2 text-seal">{result.message}</p>
          <p className="text-ink-soft text-[15px]">
            You&rsquo;ll hear from us once the first open league forms in
            your region.
          </p>
        </div>
      ) : session ? (
        <form onSubmit={handleRegister} className="space-y-8">
          <p className="font-data text-[12px] uppercase tracking-wider text-ink-soft">
            Signed in as{" "}
            <span className="text-ink">{session.user.email}</span>{" "}
            <button
              type="button"
              onClick={handleSignOut}
              className="text-seal hover:underline normal-case ml-2"
            >
              not you?
            </button>
          </p>

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
              name="name"
              type="text"
              className="w-full bg-transparent border-b border-rule py-3 mt-2 focus:border-seal outline-none"
            />
          </label>

          <label className="block">
            <span className="font-data text-[12px] uppercase tracking-wider text-ink-soft">
              Country
            </span>
            <input
              required
              name="country"
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

          {result && !result.ok && (
            <p className="font-data text-[12px] text-seal">{result.message}</p>
          )}

          <button
            type="submit"
            disabled={registering}
            className="font-data text-[13px] uppercase tracking-wider bg-ink text-paper px-8 py-4 hover:bg-seal transition-colors disabled:opacity-50"
          >
            {registering ? "Registering\u2026" : `Register as ${role}`}
          </button>
        </form>
      ) : (
        <div>
          {linkSent ? (
            <div className="border border-rule p-8">
              <p className="font-display text-2xl mb-2">Check your inbox.</p>
              <p className="text-ink-soft text-[15px]">{linkMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSendLink} className="space-y-6">
              <label className="block">
                <span className="font-data text-[12px] uppercase tracking-wider text-ink-soft">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent border-b border-rule py-3 mt-2 focus:border-seal outline-none"
                />
              </label>
              <p className="font-data text-[12px] text-ink-soft">
                No password. We&rsquo;ll email you a one-time link to sign in.
              </p>
              {linkMessage && !linkSent && (
                <p className="font-data text-[12px] text-seal">{linkMessage}</p>
              )}
              <button
                type="submit"
                disabled={sendingLink}
                className="font-data text-[13px] uppercase tracking-wider bg-ink text-paper px-8 py-4 hover:bg-seal transition-colors disabled:opacity-50"
              >
                {sendingLink ? "Sending\u2026" : "Send sign-in link"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
