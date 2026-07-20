# Getting from here to fully live

The site works right now with seed data and no backend. These are the only
two things left, both manual, both ~2 minutes each.

## 1. Create the Supabase project

1. supabase.com → New Project (name it `one-alphabet` — keep it separate
   from your Android apps' Supabase project)
2. Once it's created: SQL Editor → paste the contents of
   `supabase/schema.sql` → Run
   This creates the `players`, `matches`, `tournaments`, `signups` tables,
   sets up row-level security, and seeds the same data currently on the site.
3. Settings → API → copy the **Project URL** and the **anon public key**

## 2. Deploy to Vercel

1. vercel.com → New Project → Import `SamarthKulkarni16/one-alphabet`
2. Before deploying, add two Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` → the Project URL from step 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → the anon key from step 1
3. Deploy

That's it — no code changes needed. The site checks for those two variables
at request time (`lib/supabase.ts`) and automatically switches from the
seed data in `lib/data.ts` to live Supabase queries the moment they're set.

## What still won't work yet (deliberately out of scope for this pass)

- Player login / accounts — signups currently land in a `signups` table for
  you to review and manually promote into `players`, rather than a full
  self-serve auth flow. Worth deciding if you want that before opening
  registration publicly.
- Admin UI for entering match results — for now that's a row insert in the
  Supabase table editor, or I can build a simple form for it next.
- Video/transcript hosting — `video_url` / `transcript_url` are plain text
  columns; wiring these to Cloudflare R2 (which you've already got set up
  for Instagram) is a small follow-up once real matches start getting recorded.
