import { joinPlayer } from "@/lib/db/queries/players";
import { isPlayerIdValid } from "@/lib/db/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
  | { playerId?: string; displayName?: string }
  | null;

  if (!body?.displayName) {
    return NextResponse.json({ error: 'displayName required' }, { status: 400 });
  }

  const displayName = body.displayName.trim();
  const playerId = body.playerId;

  const nameRegex = /^[A-Z0-9a-z-_]{1,16}$/i
  
  if (!nameRegex.test(displayName)) {
    return NextResponse.json(
      { error: "Bad Request: invalid displayName format."},
      { status: 400 }
    );
  }

  if (playerId !== undefined){
    const valid = isPlayerIdValid(playerId!)
    if (!valid) {
      return NextResponse.json(
        { error: "Bad Request: invalid playerId format" },
        { status: 400 }
      );
    }
  }
  
  const player = await joinPlayer({playerId: playerId, displayName: displayName})
  
  return NextResponse.json({
    playerId: player.id,
    displayName: player.displayName
  })
}