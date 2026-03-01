import 'server-only';
import { db } from '@/lib/db/prisma';

export type JoinPlayerInput = {
  playerId?: string;
  displayName: string;
};

export async function joinPlayer(input: JoinPlayerInput) {
  const { playerId, displayName } = input;

  if (playerId) {
    // will throw if playerId is not a valid UUID
    const existing = await db.player.findUnique({ where: { id: playerId } });

    if (existing) {
      return db.player.update({
        where: { id: playerId },
        data: {
          displayName, // allow rename on join
          lastSeenAt: new Date(),
        },
      });
    }
  }

  return db.player.create({
    data: {
      displayName,
      lastSeenAt: new Date(),
    },
  });
}

export async function getPlayerById(playerId: string) {
  return db.player.findUnique({ where: { id: playerId } });
}