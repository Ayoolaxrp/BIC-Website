-- ============================================================================
-- Babcock Investors Club — Promote Executives to Admin
-- ============================================================================
-- HOW TO USE (do this AFTER every executive has created an account):
--   1. Make sure the exec has signed up on the site (/member → Create an account)
--      OR was created under Authentication → Users → Add user.
--   2. Open Supabase → SQL Editor → New query.
--   3. Replace every 'name.lastname@babcock.edu.ng' below with the real email
--      of each executive (the email they registered with).
--   4. Run the whole file. It is safe to re-run.
--
-- Each promoted email becomes an admin and sees the full Admin Console
-- (events, articles, resources, newsletter, submissions, member sectors).
-- The sector column maps each exec to the community they lead, which is also
-- used to tag sector-specific resources.

-- ---------------------------------------------------------------------------
-- Step 1 — promote everyone (edit the emails!)
-- ---------------------------------------------------------------------------
update public.profiles set role = 'admin' where email in (
  -- Executive Board
  'president@babcock.edu.ng',          -- Okara Nissi Bisindor (President)
  'vp@babcock.edu.ng',                 -- Raimi Azeezat Pelumi (Vice President)
  'gensec@babcock.edu.ng',             -- Okorie Justine (General Secretary)
  'treasurer@babcock.edu.ng',          -- Adetunji Rebecca (Treasurer)
  'chaplain@babcock.edu.ng',           -- Adebayo Adetutu Mosadoluwa (Chaplain)
  'assoc-gensec@babcock.edu.ng',       -- Odekale Dorcas (Assoc. General Secretary)

  -- Directors & Operations
  'activities@babcock.edu.ng',         -- Awolaja Ayomide Oreoluwa (Director, Activities)
  'pr@babcock.edu.ng',                 -- Obiajulu Daniela Chidubem (Director, PR)
  'welfare@babcock.edu.ng',            -- Akindehinde Favour Eniola (Director, Welfare)
  'assoc-activities@babcock.edu.ng',   -- Momoh Favour Oloruntobi (Assoc. Director, Activities)
  'assoc-pr@babcock.edu.ng',           -- Amorin Samuel (Assoc. PR Officer)
  'assoc-welfare@babcock.edu.ng',      -- Banwat Bamji (Assoc. Director, Welfare)

  -- Sector Chairpersons
  'crypto@babcock.edu.ng',             -- Awodeyi Ayoolamikun (Chairperson, Crypto)
  'forex@babcock.edu.ng',              -- Obiokor Samuel Okeoghene (Chairperson, Forex)
  'securities@babcock.edu.ng',         -- Inofe Peace Otsebholu (Chairperson, Securities)
  'realestate@babcock.edu.ng',         -- Okunubi Kehinde Sabirat (Chairperson, Real Estate)

  -- Committee Heads
  'pr-media@babcock.edu.ng',           -- Okoye Favour Chinemerem (Head, PR/Media)
  'welfare-comm@babcock.edu.ng',       -- Oladimeji Sharon Oluwanifemi (Head, Welfare)
  'finance@babcock.edu.ng',            -- Onaolapo Aanuoluwapo Alleluia (Head, Finance)
  'events@babcock.edu.ng',             -- Atolagbe Precious Olawole (Head, Events/Logistics)
  'membership@babcock.edu.ng',         -- Adebayo Kehinde Abraham (Head, Membership)
  'research@babcock.edu.ng',           -- Opara Emmanuel Chinemerem (Head, Educational Research)
  'training@babcock.edu.ng'            -- Okere Nelson Chineze (Head, Training/Partnership)
);

-- ---------------------------------------------------------------------------
-- Step 2 — assign each sector chairperson their community (optional but useful:
-- it pre-fills which sector's resources each admin curates)
-- ---------------------------------------------------------------------------
update public.profiles set sector = 'Crypto'    where email = 'crypto@babcock.edu.ng';
update public.profiles set sector = 'Forex'     where email = 'forex@babcock.edu.ng';
update public.profiles set sector = 'Securities' where email = 'securities@babcock.edu.ng';
update public.profiles set sector = 'Real Estate' where email = 'realestate@babcock.edu.ng';

-- ---------------------------------------------------------------------------
-- Verify — list all admins
-- ---------------------------------------------------------------------------
-- Run this on its own to confirm:
-- select email, role, sector from public.profiles where role = 'admin' order by email;
