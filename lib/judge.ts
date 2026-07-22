import { supabase } from "./supabase";

export type JudgeResult =
  | { status: "judged"; winnerId: string | null; summary: string }
  | { status: "judging" }
  | { status: "pending"; reason?: string }
  | { status: "failed"; reason?: string }
  | { status: "error"; message: string };

export async function triggerJudging(matchId: string): Promise<JudgeResult> {
  if (!supabase) return { status: "error", message: "Not connected." };
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { status: "error", message: "Not signed in." };

  try {
    const res = await fetch("/api/judge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ matchId }),
    });
    const data = await res.json();
    if (!res.ok) return { status: "error", message: data.error ?? "Judging failed." };
    return data as JudgeResult;
  } catch {
    return { status: "error", message: "Network error." };
  }
}
