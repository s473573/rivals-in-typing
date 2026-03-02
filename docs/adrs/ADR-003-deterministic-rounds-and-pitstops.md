# ADR-003: Deterministic rounds + periodic pit stops

## Context
The game requires timed rounds and all players should stay in sync. Using server timers and shared state is awkward in serverless deployments.

## Decision
Rounds are **deterministic** and derived from time:
- `roundId = floor(nowMs / ROUND_MS)`
- `timeLeft = endsAt - nowMs`
- Clients sync once to server time using `GET /api/time` and keep a local offset

A **pit stop** intermission happens every 6 rounds:
- 6 typing rounds + 1 pit stop round (same timer cadence)
- During pit stop, typing is disabled and a summary dialog loads player stats

## Consequences
### Positive
- No server-side timers required
- All clients converge on the same round schedule
- Pit stops make the game feel like “sets” and reduce fatigue

### Negative / limitations
- Requires basic clock-sync (handled via server offset)
- Network delays mean progress updates aren’t guaranteed every keystroke (we throttle and accept best-effort)