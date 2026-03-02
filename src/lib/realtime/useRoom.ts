'use client';

import { useEffect, useMemo, useState } from 'react';
import Ably from 'ably';

export type LiveProgress = {
  playerId: string;
  displayName: string;
  roundId: number;
  typed: string;
  wpm: number;
  accuracy: number;
  updatedAt: number;
};

type PresenceData = {
  playerId: string;
  displayName: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isPresenceData(v: unknown): v is PresenceData {
  return (
    isRecord(v) &&
    typeof v.playerId === 'string' &&
    typeof v.displayName === 'string'
  );
}

type IncomingProgress = Omit<LiveProgress, 'updatedAt'>;

function isIncomingProgress(v: unknown): v is IncomingProgress {
  return (
    isRecord(v) &&
    typeof v.playerId === 'string' &&
    typeof v.displayName === 'string' &&
    typeof v.roundId === 'number' &&
    typeof v.typed === 'string' &&
    typeof v.wpm === 'number' &&
    typeof v.accuracy === 'number'
  );
}

export function useRoom(
  roomId: string,
  me: { playerId: string; displayName: string } | null
) {
  const [ably, setAbly] = useState<Ably.Realtime | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const client = new Ably.Realtime({
      authUrl: '/api/realtime/token',
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAbly(client);
    return () => {
      client.close();
      setAbly(null);
    };
  }, []);

  const channel = useMemo(
    () => (ably ? ably.channels.get(`room:${roomId}`) : null),
    [ably, roomId],
  );

  const [players, setPlayers] = useState<Array<{ playerId: string; displayName: string }>>([]);
  const [progressMap, setProgressMap] = useState<Map<string, LiveProgress>>(new Map());

  useEffect(() => {
   if (!channel || !me) return;

    let disposed = false;

    const refreshMembers = async () => {
      const members = await channel.presence.get();
      if (disposed) return;

      const nextPlayers = members
        .map((m) => m.data as unknown)
        .filter(isPresenceData)
        .map((d) => ({ playerId: d.playerId, displayName: d.displayName }));

      setPlayers(nextPlayers);
    };

    (async () => {
      await channel.presence.enter({ playerId: me.playerId, displayName: me.displayName });

      await refreshMembers();

      // presence updates (simple approach: refresh list)
      channel.presence.subscribe(() => {
        void refreshMembers();
      });

      // progress messages
      channel.subscribe('progress', (msg) => {
        const data = msg.data as unknown;
        if (!isIncomingProgress(data)) return;

        setProgressMap((prev) => {
          const next = new Map(prev);
          next.set(data.playerId, { ...data, updatedAt: Date.now() });
          return next;
        });
      });
    })().catch(() => {
    });

    return () => {
      disposed = true;
      channel.presence.leave().catch(() => {});
      channel.unsubscribe();
    };
  }, [channel, me]);

  /**
   * Publish my progress.
   * Note: playerId + displayName are always taken from `me` (source of truth).
   */
  async function publishProgress(p: Omit<IncomingProgress, 'playerId' | 'displayName'>) {
    if (!channel || !me) return;

    await channel.publish('progress', {
      ...p,
      playerId: me.playerId,
      displayName: me.displayName,
    });
  }

  return { players, progressMap, publishProgress };
}