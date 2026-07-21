-- Wipes all sport data (players, signups, matches) back to a clean slate.
-- This does NOT delete your auth account — do that separately:
-- Supabase Dashboard → Authentication → Users → find your email → Delete user.
-- (Deleting auth users via the dashboard is safer than raw SQL — it
-- correctly cleans up related session/identity rows too.)

delete from one_alphabet.matches;
delete from one_alphabet.signups;
delete from one_alphabet.players;
