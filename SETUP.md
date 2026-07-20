# Getting from here to fully live

The site works right now with seed data and no backend. These are the only
things left, all manual, all a few minutes each.

## 1. Add the schema to your existing Supabase project

No new project needed — this reuses the same one your Android apps share
(`rrwycwlahzcxldowvfnm.supabase.co`), just in its own schema so it can't
touch Flow Timer / Minima / Daily Logs / Notes App tables.

1. Open that project → SQL Editor → paste the contents of
   `supabase/schema.sql` → Run
   This creates a `one_alphabet` schema with `players`, `matches`,
   `tournaments`, `signups`, sets up row-level security, and seeds the same
   data currently on the site.
2. **Important — this part can only be done in the dashboard, not SQL:**
   Project Settings → API → Data API Settings → **Exposed schemas** → add
   `one_alphabet` to the list (alongside `public`) → Save.
   Without this step the API can't see the new tables even though they exist.
3. Settings → API → copy the **Project URL** and the **anon public key**
   (same ones your Android apps already use, if you have them handy)

## 2. Deploy to Vercel

1. vercel.com → New Project → Import `SamarthKulkarni16/one-alphabet`
2. Before deploying, add two Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` → the Project URL from step 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → the anon key from step 1
3. Deploy

No code changes needed either way — `lib/supabase.ts` checks for those two
variables and automatically switches from the seed data in `lib/data.ts` to
live queries against the `one_alphabet` schema the moment they're set.

## What still won't work yet (deliberately out of scope for this pass)

- Player login / accounts — signups land in `one_alphabet.signups` for you
  to review and manually promote into `players`, rather than a full
  self-serve auth flow. Worth deciding if you want that before opening
  registration publicly.
- Admin UI for entering match results — for now that's a row insert in the
  Supabase table editor, or I can build a simple form for it next.
- Video/transcript hosting — `video_url` / `transcript_url` are plain text
  columns; wiring these to Cloudflare R2 (already set up for Instagram) is
  a small follow-up once real matches start getting recorded.
