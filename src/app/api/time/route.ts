import { NextResponse } from "next/server"

export function GET() {
    const now = Date.now();
    return NextResponse.json({ now });
}