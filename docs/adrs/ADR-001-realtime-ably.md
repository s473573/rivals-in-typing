# ADR-001: Realtime transport via Ably (presence + pub/sub)

## Context
The app requires real-time updates (live progress, WPM, accuracy) for multiple players in the same room. The app is deployed to Vercel, where running a traditional long-lived WebSocket server is not the default serverless pattern.

## Decision
Use **Ably** for realtime:
- **Presence** to track which players are currently in the room
- **Pub/Sub messages** to broadcast progress updates (`progress` events)
- Token auth is handled via a server route (`GET /api/realtime/token`) so secrets never reach the client

## Consequences
### Positive
- Works cleanly with Vercel deployments
- Presence is built-in and simplifies the “who is online” table
- Pub/sub keeps the client logic simple and extensible (add events later)

### Negative / limitations
- External dependency (vendor availability/pricing)
- Client events are best-effort; you must design around occasional missing updates (we do)
- Production hardening would add rate limiting and server-side validation strategies