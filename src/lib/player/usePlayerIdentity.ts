/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';

type PlayerIdentity = { playerId: string; displayName: string };

const LS_ID = 'typingrivals.playerId';
const LS_NAME = 'typingrivals.displayName';

export function usePlayerIdentity() {
  const [player, setPlayer] = useState<PlayerIdentity | null>(null);

  useEffect(() => {
    const playerId = localStorage.getItem(LS_ID);
    const displayName = localStorage.getItem(LS_NAME);
    if (playerId && displayName) setPlayer({ playerId, displayName });
  }, []);

  async function join(displayName: string) {
    const existingId = localStorage.getItem(LS_ID) ?? undefined;
    const res = await fetch('/api/players/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, playerId: existingId }),
    });
    if (!res.ok) throw new Error('join failed');
    const data = (await res.json()) as { playerId: string; displayName: string };

    localStorage.setItem(LS_ID, data.playerId);
    localStorage.setItem(LS_NAME, data.displayName);
    setPlayer({ playerId: data.playerId, displayName: data.displayName });
  }

  return { player, join };
}