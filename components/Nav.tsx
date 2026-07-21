"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const links = [
  { href: "/constitution", label: "Constitution" },
  { href: "/rankings", label: "Rankings" },
  { href: "/battle", label: "Battle" },
  { href: "/history", label: "History" },
  { href: "/archive", label: "Archive" },
  { href: "/tournaments", label: "Tournaments" },
];

export default function Nav() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSignedIn(Boolean(s));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header className="border-b border-rule">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-display text-lg tracking-tight text-ink"
          >
            One Alphabet
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-data text-[13px] uppercase tracking-wider text-ink-soft">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-seal transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/join"
            className="font-data text-[13px] uppercase tracking-wider border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
          >
            {signedIn ? "Me" : "Join"}
          </Link>
        </div>
      </div>
    </header>
  );
}
