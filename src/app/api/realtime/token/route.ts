import { NextResponse } from 'next/server';
import Ably from 'ably';

export async function GET() {
  const key = process.env.ABLY_API_KEY;
  if (!key) return NextResponse.json({ error: 'ABLY_API_KEY missing' }, { status: 500 });

  const rest = new Ably.Rest(key);
  const tokenRequest = await rest.auth.createTokenRequest({
    clientId: 'anon', // optional
  });

  return NextResponse.json(tokenRequest);
}