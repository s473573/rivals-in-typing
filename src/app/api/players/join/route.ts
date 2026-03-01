import { joinPlayer } from "@/lib/db/queries/players";
import { isPlayerIdValid } from "@/lib/db/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { playerId: string, displayName: string } }
) {
  const { playerId, displayName } = params

  const nameRegex = /^[A-Z0-9a-z-_]{1,16}$/i
  
  const name = displayName.trim()
  if (!nameRegex.test(name)) {
    return NextResponse.json(
      { error: "Bad Request: invalid displayName format."},
      { status: 400 }
    );
  }

  const valid = isPlayerIdValid(playerId)
  if (!valid) {
    return NextResponse.json(
      { error: "Bad Request: invalid playerId format" },
      { status: 400 }
    );
  }
  
  joinPlayer({playerId: playerId, displayName: name})
  
  return NextResponse.json(
    {playerId, 'displayName': name}
  )
}