# Rivals-in-Typing ✍️
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Neon](https://img.shields.io/badge/Neon-Postgres-00E599?logo=postgresql)
![Ably](https://img.shields.io/badge/Ably-Realtime-ff2d55?logo=ably)
![Vitest](https://img.shields.io/badge/Vitest-tests-6E9F18?logo=vitest)
![Vercel](https://img.shields.io/badge/Vercel-deploy-black?logo=vercel)

A tiny real-time typing duel (Typeracer-ish) with a newspaper-riddle vibe: warm paper texture, clean rules, mono stats.

Go race each other live! [https://rivals-in-typing.vercel.app/]

---

## Features
- **Deterministic timed rounds** (stateless, derived from time; no server timers)
- **Realtime multiplayer** (presence + live progress updates)
- **Live feedback while typing**
  - sentence highlights correct/incorrect keystrokes
  - big bottom-center “typing pad” captures keys after one click
- **Metrics**
  - WPM + Accuracy (simple, predictable rules)
- **Persistence**
  - returning player identity (localStorage + DB)
  - per-round results stored in Postgres
  - aggregated stats via `/api/players/:id/stats`
- **Pit stops** every **6 rounds**
  - a short intermission to compare stats, breathe, and optionally leave

---

## UX / style decisions
- **“Paper UI”**: serif headlines + mono numbers, thin borders, warm faded background (newspaper puzzle column energy).
- **Simple correctness model** (intentionally “lightweight”):
  - correctness is computed position-wise against the target sentence
  - backspace can fully “fix” mistakes (stateless recalculation)
  - this keeps gameplay forgiving and reduces complexity for the time box

---

## Tech stack
- **Next.js (App Router) + TypeScript**
- **Ably** for realtime pub/sub + presence
- **Neon Postgres** for persistence
- **Prisma** ORM (Prisma 7 + Neon adapter)
- **Vitest** unit tests for core logic

---

## Architecture (quick mental model)
- **Rounds are deterministic**: round id and countdown are computed from time (`/api/time` used once to sync offset).
- **Realtime**:
  - clients join Ably presence for a room
  - clients publish progress events (throttled)
  - leaderboard renders presence + latest progress map
- **DB**:
  - results are stored per `(roundId, playerId)`
  - winner/leaderboard is computed, not stored
  - player stats are aggregates from `round_results`

---

## Endpoints
- `GET /api/time` → `{ now }`
- `POST /api/players/join` → upsert player, returns `{ playerId, displayName }`
- `GET /api/players/:playerId/stats` → `{ playerId, roundsPlayed, averageWPM, averageAccuracy, totalCorrectChars }`
- `POST /api/rounds/:roundId/result` → upsert round result for player
- `GET /api/rounds/:roundId/leaderboard` → (optional) round leaderboard snapshot
- `GET /api/realtime/token` → Ably token request (server-signed)

---

## Local development
### 1) Install deps
```bash
npm install
```
### 2) Environment variables
Create .env based on .env.example:
```env
# Neon
DATABASE_URL="..."   # pooled (pooler) connection string
DIRECT_URL="..."     # direct connection string (migrations/CLI)

# Ably
ABLY_API_KEY="..."   # server-side only
```
### 3) DB setup
```bash
npx prisma generate
npx prisma migrate dev
```

### 4) Run
```bash
npm run dev
```

### 5) Demo it

Just open two tabs and join with different names.
Type — see live progress. After 6 rounds you hit the pit stop summary.

## Tests
```bash
npm test
```

## Tradeoffs
* No full anti-cheat: client computes and submits results. (Production: server recompute + stricter validation.)
* Sentences are static and deterministic (roundId → sentence). (Production: store/version sentence packs.)
* Realtime updates are best-effort and throttled to keep traffic reasonable.

---

## Next steps
- **Rooms**
  - Support `/r/[roomId]` with room-specific Ably channels and optional room settings (round duration, sentence pack).
  - Persist room metadata and allow “share link → join same duel”.
- **E2E test coverage (Playwright)**
  - Happy path: open two pages, join with different names, type, assert the other page receives live progress.
  - Pit stop flow: after 6 rounds, ensure the summary dialog appears and stats load.
- **Server-validated scoring**
  - Submit `typedText + elapsedMs` and recompute WPM/accuracy server-side to reduce cheating.
  - Add stricter validation and rate limiting for submissions.
- **URL-synced table state**
  - Persist leaderboard sorting/pagination in query params so refresh/share keeps the view.
- **Operational hardening**
  - Observability: structured logs + request IDs
  - Realtime throttling/backpressure rules and graceful reconnect handling
