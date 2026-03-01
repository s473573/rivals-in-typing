import { db } from "../prisma";

export type PlayerStats = {
  playerId: string;
  roundsPlayed: number;
  averageWPM: number;
  averageAccuracy: number;
  totalCorrectChars: number;
};

export async function getPlayerStats (playerId: string) : Promise<PlayerStats> {
  const stats = await db.roundResult.findMany({
    where: {playerId: playerId}
  })
  
  if (!stats.length) {
    return {
      playerId,
      roundsPlayed: 0,
      averageWPM: 0,
      averageAccuracy: 0,
      totalCorrectChars: 0,
    };
  }
  
  const roundsPlayed = stats.length
  const averageWPM = stats.map((s) => s.wpm).reduce((s, v) => s+v, 0) / stats.length
  const averageAccuracy = stats.map((s) => s.accuracy).reduce((s, v) => s+v, 0) / stats.length
  const totalCorrectChars = stats.map((s) => s.correctChars).reduce((s, v) => s+v, 0)
  
  return {
    playerId,
    roundsPlayed,
    averageWPM,
    averageAccuracy,
    totalCorrectChars}
}