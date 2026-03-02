import { upsertRoundResult } from "@/lib/db/queries/results";
import { isPlayerIdValid } from "@/lib/db/utils";
import { NextRequest, NextResponse } from "next/server";


type SubmitRoundResultInput = {
  playerId: string;
  wpm: number;
  accuracy: number; // 0..1
  correctChars: number;
  totalChars: number;
  finalText?: string;
};

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function isNonNegativeInt(n: unknown): n is number {
  return Number.isInteger(n) && (n as number) >= 0;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
): Promise<Response> {
  const rawId = (await params).roundId
  const roundId = Number(rawId)

  if (!Number.isInteger(roundId) || roundId < 0) {
    return jsonError(400, "Bad Request: roundId must be a non-negative integer.");
  }

  // parse
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Bad Request: body must be valid JSON.");
  }

  const {
    playerId,
    wpm,
    accuracy,
    correctChars,
    totalChars,
    finalText,
  } = body as Partial<SubmitRoundResultInput>;
  
  console.log("result payload", { roundId, playerId, wpm, accuracy, correctChars, totalChars });

  // validate
  if (typeof playerId !== "string" || playerId.length === 0) {
    return jsonError(400, "Bad Request: playerId is required.");
  }
  
  if (!isPlayerIdValid(playerId)) {
    return jsonError(400, `Bad Request: ${playerId} is not a valid playerId.`)
  }

  if (!isFiniteNumber(wpm) || wpm < 0) {
    return jsonError(400, "Bad Request: wpm must be a finite number >= 0.");
  }

  if (!isFiniteNumber(accuracy) || accuracy < 0 || accuracy > 1) {
    return jsonError(400, "Bad Request: accuracy must be a finite number in range 0..1.");
  }

  if (!isNonNegativeInt(correctChars)) {
    return jsonError(400, "Bad Request: correctChars must be an integer >= 0.");
  }

  if (!isNonNegativeInt(totalChars)) {
    return jsonError(400, "Bad Request: totalChars must be an integer >= 0.");
  }

  if (correctChars > totalChars) {
    return jsonError(400, "Bad Request: correctChars cannot exceed totalChars.");
  }

  if (finalText !== undefined && typeof finalText !== "string") {
    return jsonError(400, "Bad Request: finalText must be a string if provided.");
  }

  // prevents someone sending a megabyte
  if (finalText && finalText.length > 10_000) {
    return jsonError(413, "Payload Too Large: finalText is too long.");
  }
  
  // persist
  const result = await upsertRoundResult({
    roundId,
    playerId,
    wpm,
    accuracy,
    correctChars,
    totalChars,
    finalText: finalText ?? null,
  });

  return NextResponse.json({ ok: true, result });
}