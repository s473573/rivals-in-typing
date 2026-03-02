'use client';

import { useEffect, useState } from 'react';
import { getRoundState, ROUND_MS } from '@/lib/time/roundClock';

export function useRoundState(offsetMs: number, roundMs = ROUND_MS) {
  const [state, setState] = useState(() => getRoundState(Date.now() + offsetMs, roundMs));

  useEffect(() => {
    const id = setInterval(() => {
      setState(getRoundState(Date.now() + offsetMs, roundMs));
    }, 100);
    return () => clearInterval(id);
  }, [offsetMs, roundMs]);

  return state; // { roundId, endsAt, timeLeft, progress }
}