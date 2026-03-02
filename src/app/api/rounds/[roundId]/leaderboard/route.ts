import { getRoundLeaderboard, type LeaderboardRowDto } from "@/lib/db/queries/leaderboard";
import { NextRequest, NextResponse } from "next/server";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
): Promise<Response> {
  const rawId = (await params).roundId
  const roundId = Number(rawId)

  if (!Number.isInteger(roundId) || roundId < 0) {
    return jsonError(400, "Bad Request: roundId must be a non-negative integer.");
  }

  // optional query param: ?limit=20
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 50;

  const rows = await getRoundLeaderboard(roundId, limit);

  const dto: LeaderboardRowDto[] = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({ roundId, rows: dto });
}