# ADR-002: Persistence with Neon Postgres + Prisma

## Context
We need durable storage for:
- returning players
- per-round results
- aggregated player stats

We also want a deployment-friendly managed Postgres service.

## Decision
Use **Neon Postgres** as the database and **Prisma** as the ORM:
- Runtime app queries use `DATABASE_URL` (pooled connection)
- Prisma CLI (migrations) uses `DIRECT_URL` (direct connection)
- Prisma Client uses the Neon adapter

## Consequences
### Positive
- Minimal ops overhead (managed Postgres)
- Prisma provides schema + type-safe DB access
- Clear separation between runtime connections and migration connections

### Negative / limitations
- Requires correct env var setup (two URLs)
- In production, migrations should run in a controlled pipeline rather than on every build