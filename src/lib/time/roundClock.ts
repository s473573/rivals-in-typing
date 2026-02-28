export type RoundState = {
  roundId: number,
  startedAt: number,
  endsAt: number,
  timeLeft: number, // 0..roundMs
  progress: number  // 0..1
}

export const ROUND_MS = 30_000

function assertRoundMs(roundMs: number): void {
  if (!Number.isFinite(roundMs) || roundMs <= 0) {
    throw new Error("roundMs must be a finite number > 0");
  }
}

export function getRoundId(nowMs: number, roundMs = ROUND_MS): number {
  assertRoundMs(roundMs);
  return Math.floor(nowMs / roundMs);
}

export function getRoundStartedAtMs(roundId: number, roundMs = ROUND_MS): number {
  assertRoundMs(roundMs);
  return roundId * roundMs;
}

export function getRoundEndsAtMs(roundId: number, roundMs = ROUND_MS): number {
  assertRoundMs(roundMs);
  return (roundId + 1) * roundMs;
}

export function getRoundState(nowMs: number, roundMs = ROUND_MS): RoundState {
  const roundId = getRoundId(nowMs, roundMs)
  const startedAt = getRoundStartedAtMs(roundId, roundMs)
  const endsAt = getRoundEndsAtMs(roundId, roundMs)
  const timeLeft = Math.min(roundMs, Math.max(0, endsAt - nowMs))
  const progress = 1 - timeLeft / roundMs;

  return {
    startedAt,
    endsAt,
    roundId,
    timeLeft,
    progress
  }
}