import 'server-only';
import { db } from '@/lib/db/prisma';

export type UpsertRoundResultInput = {
  roundId: number;
  playerId: string; // uuid
  wpm: number;
  accuracy: number; // 0..1
  correctChars: number;
  totalChars: number;
  finalText?: string | null;
};

export async function upsertRoundResult(input: UpsertRoundResultInput) {
  const { roundId, playerId, wpm, accuracy, correctChars, totalChars, finalText } = input;

  return db.roundResult.upsert({
    where: {
      roundId_playerId: {
        roundId,
        playerId,
      },
    },
    create: {
      roundId,
      playerId,
      wpm,
      accuracy,
      correctChars,
      totalChars,
      finalText: finalText ?? null,
    },
    update: {
      wpm,
      accuracy,
      correctChars,
      totalChars,
      finalText: finalText ?? null,
    },
  });
}