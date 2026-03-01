import { db } from "../prisma";

export type LeaderboardRow = {
  playerId: string;
  displayName: string | null;
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  finalText: string | null;
  createdAt: Date;
};

export type LeaderboardRowDto = Omit<LeaderboardRow, "createdAt"> & {
  createdAt: string; // ISO
};

function clampLimit(limit: number, max = 50): number {
  if (!Number.isFinite(limit)) return max;
  return Math.max(1, Math.min(max, Math.floor(limit)));
}

export async function getRoundLeaderboard(roundId: number, limit = 50) {
  const take = clampLimit(limit)

  const rows = await db.roundResult.findMany({
    where: { roundId },
    orderBy: [
      { wpm: 'desc' },
      { accuracy: 'desc' },
      { createdAt: 'asc' }, // deterministic tie-breaker
    ],
    take,
    include: {
      player: { select: { id: true, displayName: true } },
    },
  });

  const mapped: LeaderboardRow[] = rows.map((r) => ({
    playerId: r.player.id,
    displayName: r.player.displayName ?? null,
    wpm: r.wpm,
    accuracy: r.accuracy,
    correctChars: r.correctChars,
    totalChars: r.totalChars,
    finalText: r.finalText ?? null,
    createdAt: r.createdAt,
  }));

  return mapped;
}