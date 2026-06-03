# KSFC Attendance Tracker (PAT)

Mobile-friendly training attendance for Kernow Storm FC. Next.js 15, Prisma, Neon Postgres, Vercel.

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` (Neon) and `SESSION_SECRET` (32+ chars).

2. Install and sync the database:

```bash
cd ~/Developer/PAT
npm install
npx prisma migrate deploy   # or: npm run db:push for a fresh dev DB
npm run db:seed
```

3. Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Default seed logins:

| First name (username) | Password (default) |
|-----------------------|-------------------|
| `rocky` | `SEED_ADMIN_PASSWORD` (`changeme`) |
| `hobie` | same (or `SEED_HOBIE_PASSWORD`) |

Teams seeded: **KSFC U19G Van Husen** (26 players), **KSFC U16G Richardson** (empty roster).

## Seasons & archive

Each team tracks data in an **active season**. Tap **Season: …** in the header (or Roster → Season & archive) to:

- **Archive & start fresh** — keeps old attendance/games as read-only history; new season starts empty (roster unchanged — archive players on Roster as they leave).
- View archived season summaries (session/game counts).

After nationals, archive (e.g. `2025 Nationals`) and start `2026-27` when you begin counting attendance for the new cycle.

## Games

**Games** tab: date, time, opponent, who played, goals, assists, rating 1–5, per-player notes, team notes, opponent notes. **Season stats** on the games list shows totals per player.

Run new migration after pull:

```bash
npx prisma migrate deploy
```

## GitHub & Vercel

1. Build and test locally first.
2. Create a private repo (GitHub UI or `gh repo create ksfc-attendance-tracker --private --source=. --remote=origin --push`).
3. Import the repo in Vercel; set the same env vars as `.env`.
4. After deploy, run `npx prisma migrate deploy` against production Neon (from your machine or CI).
5. Run seed once on production: `DATABASE_URL="..." npm run db:seed`

## Add to home screen (PWA)

In Safari/Chrome: Share → **Add to Home Screen**. The app uses `manifest.ts` and KSFC-themed icons.

## Roadmap (schema-ready)

- Player logins (RSVP on planned sessions)
- Performance score 1–5 and notes per session
- Player Tracker roster import
