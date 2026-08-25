# Mavs Marketplace

A buy/sell marketplace for UT Arlington students. Login is restricted to
`@mavs.uta.edu` emails, enforced both in the UI and at the database level.

Stack: Next.js (App Router, JavaScript) + Supabase (auth, Postgres, storage,
realtime) + Tailwind CSS, deployed on Vercel.

## 1. Create your Supabase project

1. Go to https://supabase.com, sign in with GitHub, click **New project**.
2. Pick any name (e.g. `uta-marketplace`), set a database password (save it
   somewhere), pick a region close to Texas (e.g. `us-east-1`).
3. Once it's created, go to **SQL Editor > New query**, paste in the entire
   contents of `supabase/schema.sql` from this repo, and click **Run**.
   This creates the `listings`, `messages`, and `profiles` tables, locks
   signups to `@mavs.uta.edu`, and sets up the image storage bucket.
4. Go to **Project Settings > API**. You'll need two values in a minute:
   - **Project URL**
   - **anon public** key
5. Go to **Authentication > Providers > Email** and make sure "Enable email
   provider" is on, and turn OFF "Confirm email" is fine to leave on
   (magic link handles this automatically).
6. Go to **Authentication > URL Configuration** and set:
   - **Site URL**: your Vercel URL once you have it (you can update this
     after step 3 below — `http://localhost:3000` works for local dev now)
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and later
     your Vercel URL + `/auth/callback`

## 2. Run it locally (optional, to test before deploying)

```bash
npm install
cp .env.local.example .env.local
# paste your Project URL and anon key into .env.local
npm run dev
```

Visit http://localhost:3000, log in with your `axl5179@mavs.uta.edu`
address, and confirm you get a magic link email.

## 3. Push to your GitHub (ARAFLATIF)

```bash
cd uta-marketplace
git init
git add .
git commit -m "Initial commit: Mavs Marketplace MVP"
git branch -M main
git remote add origin https://github.com/ARAFLATIF/uta-marketplace.git
git push -u origin main
```

(Create the empty repo `uta-marketplace` first at
https://github.com/new under your ARAFLATIF account — don't initialize it
with a README, since you already have one.)

## 4. Deploy on Vercel

1. Go to https://vercel.com, sign in with GitHub.
2. Click **Add New > Project**, import `ARAFLATIF/uta-marketplace`.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. In a minute or two you'll get a live URL like
   `uta-marketplace.vercel.app`.
5. Go back to Supabase **Authentication > URL Configuration** and add your
   real Vercel URL (and `/auth/callback`) to Site URL / Redirect URLs.

You're live. Share the link with other `@mavs.uta.edu` students.

## What's in the MVP

- Magic-link login, hard-locked to `@mavs.uta.edu` (UI check + DB trigger)
- Post a listing with title, description, price, category, one photo
- Browse all active listings on the homepage
- View a single listing
- Real-time 1:1 chat between buyer and seller on a listing

## Natural next iterations

- Search / filter by category
- Edit or mark a listing as sold
- A proper inbox page listing all your conversations across listings
- Push/email notification on new message
- Seller ratings
