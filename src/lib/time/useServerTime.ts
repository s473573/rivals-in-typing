'use client';

import { useEffect, useMemo, useState } from 'react';

export function useServerTimeOffset() {
  const [offsetMs, setOffsetMs] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/time', { cache: 'no-store' });
      const data = (await res.json()) as { now: number };
      if (cancelled) return;
      setOffsetMs(data.now - Date.now());
      setReady(true);
    })().catch(() => setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // eslint-disable-next-line react-hooks/purity
  const nowMs = useMemo(() => Date.now() + offsetMs, [offsetMs]);
  return { offsetMs, nowMs, ready };
}