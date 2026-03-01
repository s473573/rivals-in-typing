import { db } from "@/lib/db/prisma";
import { getPlayerStats } from "@/lib/db/queries/stats";
import { isPlayerIdValid } from "@/lib/db/utils";
import { NextRequest, NextResponse } from "next/server";


export async function GET (
  _req: NextRequest,
  { params }: { params: {playerId: string }}
) {
  const { playerId } = params;

  if (!playerId) {
    return NextResponse.json(
      { error: "Bad Request: missing playerId" },
      { status: 400 }
    );
  }

  // validate input
  const valid = isPlayerIdValid(playerId)
  if (!valid) {
    return NextResponse.json(
      { error: "Bad Request: invalid playerId format" },
      { status: 400 }
    );
  }
  
  if (!playerId) {
    return NextResponse.json(
      { error: "Bad Request: missing playerId" },
      { status: 400 }
    );
  }

  // check for existence first 
  const playerExists = await db.player.findUnique({
    where: { id: playerId },
    select: { id: true },
  });

  if (!playerExists) {
    return NextResponse.json(
      { error: "Player not found" },
      { status: 404 }
    );
  }
  
  const stats = getPlayerStats(playerId)

  return NextResponse.json(stats)
}