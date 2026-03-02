'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type PresencePlayer = { playerId: string; displayName: string };

type PlayerStats = {
  playerId: string;
  roundsPlayed: number;
  averageWPM: number;
  averageAccuracy: number;
  totalCorrectChars: number;
};

function formatTime(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function PitstopDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  timeLeftMs: number;
  setIndex: number; // 0-based
  players: PresencePlayer[];
  mePlayerId?: string;
  onLeave: () => void;
}) {
  const { open, onOpenChange, timeLeftMs, setIndex, players, mePlayerId, onLeave } = props;

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [error, setError] = useState<string | null>(null);

  const playersKey = useMemo(
    () => players.map((p) => p.playerId).sort().join('|'),
    [players],
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    (async () => {
      const results = await Promise.all(
        players.map(async (p) => {
          const res = await fetch(`/api/players/${p.playerId}/stats`, {
            cache: 'no-store',
          });
          if (!res.ok) throw new Error(`stats failed for ${p.playerId}`);
          return (await res.json()) as PlayerStats;
        }),
      );

      if (cancelled) return;

      // stable ordering: by avgWPM desc, then avgAccuracy desc
      results.sort((a, b) => {
        if (b.averageWPM !== a.averageWPM) return b.averageWPM - a.averageWPM;
        if (b.averageAccuracy !== a.averageAccuracy)
          return b.averageAccuracy - a.averageAccuracy;
        return a.playerId.localeCompare(b.playerId);
      });

      setStats(results);
      setLoading(false);
    })().catch((e: unknown) => {
      if (cancelled) return;

      const message = e instanceof Error ? e.message : 'Failed to load stats';

      setError(message);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [open, playersKey]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif">
            Pit Stop · Set {setIndex + 1}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Breathe, soldier. Check the numbers. Next set begins in{' '}
          <span className="font-mono">{formatTime(timeLeftMs)}</span>.
        </p>

        <Separator />

        <Card className="shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Rounds</TableHead>
                  <TableHead className="text-right">Avg WPM</TableHead>
                  <TableHead className="text-right">Avg Acc</TableHead>
                  <TableHead className="text-right">Ttl keyhits</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      Loading stats…
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : stats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No stats yet!
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.map((s) => {
                    const isMe = mePlayerId && s.playerId === mePlayerId;
                    return (
                      <TableRow key={s.playerId} className={isMe ? 'bg-primary/5' : ''}>
                        <TableCell className="font-medium">
                          {players.find((p) => p.playerId === s.playerId)?.displayName ?? s.playerId}
                          {isMe ? <span className="ml-2 text-xs text-muted-foreground">(you)</span> : null}
                        </TableCell>
                        <TableCell className="text-right font-mono">{s.roundsPlayed}</TableCell>
                        <TableCell className="text-right font-mono">{s.averageWPM.toFixed(0)}</TableCell>
                        <TableCell className="text-right font-mono">{s.averageAccuracy.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{s.totalCorrectChars}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onLeave}>
            Leave
          </Button>
          <Button onClick={() => onOpenChange(false)}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}