/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { TypingPad } from './TypingPad';
import { PitstopDialog } from './PitstopDialog';

import { PlayersTable, type PlayerRow } from '@/components/game/PlayersTable';
import { useRoom } from '@/lib/realtime/useRoom';

import { getRoundState, ROUND_MS } from '@/lib/time/roundClock';
import { pickSentence, SENTENCE_POOL } from '@/lib/features/typing/sentences';
import { computeMetrics } from '@/lib/metrics/metrics';

type PlayerIdentity = { playerId: string; displayName: string };

const LS_ID = 'typingrivals.playerId';
const LS_NAME = 'typingrivals.displayName';

function clampName(raw: string) {
  return raw.trim().replace(/\s+/g, ' ').slice(0, 16);
}

function formatTime(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function preview(text: string, max = 28) {
  const t = text.replace(/\n/g, ' ');
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + '…';
}

function renderSentence(target: string, typed: string) {
  const chars = target.split('');

  return (
    <span className="font-serif text-lg leading-relaxed">
      {chars.map((ch, i) => {
        const t = typed[i];
        const isTyped = i < typed.length;
        const isCorrect = isTyped && t === ch;

        const cls = !isTyped
          ? ''
          : isCorrect
            ? 'bg-primary/10'
            : 'bg-destructive/10 text-destructive underline decoration-destructive/60';

        return (
          <span key={i} className={`${cls}`}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}

export function GamePage({ roomId }: { roomId: string }) {
  // ---- identity
  const [me, setMe] = useState<PlayerIdentity | null>(() => {
    if (typeof window === 'undefined') return null;
    const id = localStorage.getItem(LS_ID);
    const name = localStorage.getItem(LS_NAME);
    return id && name ? { playerId: id, displayName: name } : null;
  });
  const [joinOpen, setJoinOpen] = useState(() => me === null);

  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  async function join(displayName: string) {
    const clean = clampName(displayName);
    if (!clean) {
      setJoinError('Name can’t be empty.');
      return;
    }

    const existingId = localStorage.getItem(LS_ID) ?? undefined;
    console.log("existingId:", existingId)

    const res = await fetch('/api/players/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: clean, playerId: existingId }),
    });

    if (!res.ok) {
      setJoinError('Join failed. Please try again.');
      return;
    }

    const data = (await res.json()) as { playerId: string; displayName: string };
    console.log("join response", data);
    localStorage.setItem(LS_ID, data.playerId);
    localStorage.setItem(LS_NAME, data.displayName);

    setMe({ playerId: data.playerId, displayName: data.displayName });
    setJoinOpen(false);
    setJoinError(null);
  }
  
  function leaveRoom() {
    localStorage.removeItem('typingrivals.playerId');
    localStorage.removeItem('typingrivals.displayName');
    setMe(null);
    setJoinOpen(true);
    setPitOpen(false);
  }

  // ---- time offset (server sync once)
  const [offsetMs, setOffsetMs] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/time', { cache: 'no-store' });
      const data = (await res.json()) as { now: number };
      if (cancelled) return;
      setOffsetMs(data.now - Date.now());
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const [roundState, setRoundState] = useState(() =>
  getRoundState(Date.now() + offsetMs, ROUND_MS)
  );
  const { roundId, timeLeft, progress } = roundState;
  const elapsedMs = Math.max(0, ROUND_MS - timeLeft);
  
  const ROUNDS_PER_SET = 6;
  const CYCLE_LEN = ROUNDS_PER_SET + 1; // 6 typing + 1 time-out

  const cyclePos = ((roundId % CYCLE_LEN) + CYCLE_LEN) % CYCLE_LEN;
  const isPitStop = cyclePos === ROUNDS_PER_SET;
  const setIndex = Math.floor(roundId / CYCLE_LEN);

  // for sentence picking, ignore the pit stops
  const typingRoundIndex = setIndex * ROUNDS_PER_SET + Math.min(cyclePos, ROUNDS_PER_SET - 1);

  const sentence = useMemo(() => {
    if (isPitStop) return { id: 'pitstop', text: 'Pit stop.' };
    return pickSentence(typingRoundIndex, SENTENCE_POOL);
  }, [isPitStop, typingRoundIndex]);
  
  // ---- realtime room
  const { players, progressMap, publishProgress } = useRoom(roomId, me);

  // ---- typing state
  const [typed, setTyped] = useState('');
  
  const isComplete = typed === sentence.text;

  // freeze elapsed time once completed so WPM doesn't decay
  const [frozenElapsedMs, setFrozenElapsedMs] = useState<number | null>(null);
  
  useEffect(() => {
    if (isComplete && frozenElapsedMs === null) setFrozenElapsedMs(elapsedMs);
    if (!isComplete && frozenElapsedMs !== null) setFrozenElapsedMs(null);
  }, [isComplete, elapsedMs, frozenElapsedMs]);
  
  const effectiveElapsedMs = frozenElapsedMs ?? elapsedMs;

  const metrics = useMemo(() => {
    return computeMetrics({
        target: sentence.text,
        typed,
        elapsedMs: effectiveElapsedMs
    })
  }, [sentence.text, typed, effectiveElapsedMs]);

  // ---- publish throttling
  const lastPublishAt = useRef(0);
  useEffect(() => {
    if (!me) return;

    const now = Date.now();
    if (now - lastPublishAt.current < 150) return;
    lastPublishAt.current = now;

    publishProgress({
      roundId,
      typed,
      wpm: metrics.wpm,
      accuracy: metrics.accuracy,
    }).catch(() => {});
  }, [me, publishProgress, roundId, typed, metrics.wpm, metrics.accuracy]);

  // ---- submit on round change
  const prevRoundId = useRef<number | null>(null);
  const snapshotRef = useRef<{
    roundId: number;
    wpm: number;
    accuracy: number;
    correctChars: number;
    totalChars: number;
    finalText: string;
  } | null>(null);
  
  const submittedRound = useRef<number | null>(null);

useEffect(() => {
  if (!me || !isComplete) return;
  if (submittedRound.current === roundId) return;

  submittedRound.current = roundId;

  fetch(`/api/rounds/${roundId}/result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId: me.playerId,
      wpm: metrics.wpm,
      accuracy: metrics.accuracy,
      correctChars: metrics.correctChars,
      totalChars: metrics.typedChars,
      finalText: typed,
    }),
  }).catch(() => {});
}, [me, isComplete, roundId, metrics, typed]);

  // keep last known snapshot for this round
  useEffect(() => {
    snapshotRef.current = {
      roundId,
      wpm: metrics.wpm,
      accuracy: metrics.accuracy,
      correctChars: metrics.correctChars,
      totalChars: metrics.typedChars,
      finalText: typed,
    };
  }, [roundId, metrics, typed]);
  
  useEffect(() => {
  const id = setInterval(() => {
    const next = getRoundState(Date.now() + offsetMs, ROUND_MS);

    const prev = prevRoundId.current;
    if (prev === null) {
      prevRoundId.current = next.roundId;
      setRoundState(next);
      return;
    }
    if (prev !== null && next.roundId !== prev) {
      // round advanced -> submit previous snapshot best-effort
      const snap = snapshotRef.current;
      if (me && snap && snap.roundId === prev) {
        fetch(`/api/rounds/${prev}/result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: me.playerId,
            wpm: snap.wpm,
            accuracy: snap.accuracy,
            correctChars: snap.correctChars,
            totalChars: snap.totalChars,
            finalText: snap.finalText,
          }),
        }).catch(() => {});
      }

      setTyped('');
      submittedRound.current = null;
      setFrozenElapsedMs(null);
    }

    prevRoundId.current = next.roundId;
    setRoundState(next);
  }, 100);

  return () => clearInterval(id);
}, [offsetMs, me]);

  // ---- pit stop state

  const [pitOpen, setPitOpen] = useState(false);
  const shownSetRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPitStop) {
      setPitOpen(false);
      return;
    }
    // open once per pit stop set
    if (shownSetRef.current !== setIndex) {
      shownSetRef.current = setIndex;
      setPitOpen(true);
    }
  }, [isPitStop, setIndex]);

  // ---- build table rows
  const rows: PlayerRow[] = useMemo(() => {
    const byId = new Map<string, { displayName: string; typed: string; wpm: number; acc: number }>();

    for (const p of players) {
      byId.set(p.playerId, { displayName: p.displayName, typed: '', wpm: 0, acc: 0 });
    }

    // apply progress
    for (const [pid, prog] of progressMap.entries()) {
      const existing = byId.get(pid) ?? { displayName: prog.displayName, typed: '', wpm: 0, acc: 0 };
      byId.set(pid, {
        displayName: existing.displayName || prog.displayName,
        typed: prog.roundId === roundId ? prog.typed : '',
        wpm: prog.roundId === roundId ? prog.wpm : 0,
        acc: prog.roundId === roundId ? prog.accuracy : 0,
      });
    }

    // ensure row is correct even if publish lags
    if (me) {
      const existing = byId.get(me.playerId) ?? { displayName: me.displayName, typed: '', wpm: 0, acc: 0 };
      byId.set(me.playerId, {
        displayName: existing.displayName || me.displayName,
        typed,
        wpm: metrics.wpm,
        acc: metrics.accuracy,
      });
    }

    const out = Array.from(byId.entries()).map(([playerId, v]) => ({
      playerId,
      displayName: v.displayName,
      typedPreview: preview(v.typed),
      wpm: v.wpm,
      accuracy: v.acc,
    }));

    // sort: wpm desc, acc desc, name asc
    out.sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return a.displayName.localeCompare(b.displayName);
    });

    return out;
  }, [players, progressMap, me, typed, metrics.wpm, metrics.accuracy, roundId]);

  return (
    <main className="min-h-screen bg-background py-10">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="rounded-lg border bg-background shadow-sm">
          <header className="border-b px-6 py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Live Puzzle · Room {roomId}
                </p>
                <h1 className="text-3xl font-bold tracking-tight font-serif">Rivals-in-Typing</h1>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Round ends in</p>
                <p className="font-mono text-lg">{formatTime(timeLeft)}</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-8 px-6 py-7 lg:grid-cols-12">
            {/* LEFT */}
            <section className="space-y-6 lg:col-span-7">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  You&apos;re playing as{' '}
                  <span className="font-medium">{me?.displayName ?? '—'}</span>
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Smooth beats fast.
                </p>
              </div>

              <Card className="shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
                    Sentence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderSentence(sentence.text, typed)}
                  {isComplete ? (
                    <div className="mt-4 rounded-md border bg-primary/5 px-3 py-2">
                      <p className="font-serif text-sm">
                        ✓ Solved. Nicely done.
                        <span className="ml-2 font-mono text-muted-foreground">
                          ({metrics.wpm.toFixed(0)} WPM · {metrics.accuracy.toFixed(2)} acc)
                        </span>
                      </p>
                    </div>
                  ) : null}
                  <Separator className="my-4" />
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Your WPM</p>
                      <p className="font-mono text-lg">{Number.isFinite(metrics.wpm) ? metrics.wpm.toFixed(0) : '0'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Accuracy</p>
                      <p className="font-mono text-lg">{Number.isFinite(metrics.accuracy) ? metrics.accuracy.toFixed(2) : '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Progress</p>
                      <p className="font-mono text-lg">{Math.round(progress * 100)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* RIGHT */}
            <aside className="space-y-6 lg:col-span-5">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight font-serif">Live Leaderboard</h2>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Open another tab to test multiplayer. Presence controls who appears here.
                </p>
              </div>

              <Card className="shadow-none">
                <CardContent className="p-0">
                  <PlayersTable rows={rows} />
                </CardContent>
              </Card>
            </aside>
          </div>
          <div className="border-t px-6 py-6">
            <div className="mx-auto max-w-3xl">
              <TypingPad
                typed={typed}
                setTyped={setTyped}
                disabled={!me || isComplete || isPitStop}
                maxLen={sentence.text.length}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Join the round</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Pick a name. It’ll be saved in your browser.
              </p>
              <Input
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="e.g. ink-and-keys"
                maxLength={32}
              />
              {joinError ? <p className="text-xs text-destructive">{joinError}</p> : null}
            </div>

            <Button
              onClick={() => join(joinName)}
              className="w-full"
            >
              Join
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PitstopDialog
        open={pitOpen && isPitStop}
        onOpenChange={setPitOpen}
        timeLeftMs={timeLeft}
        setIndex={setIndex}
        players={players}
        mePlayerId={me?.playerId}
        onLeave={leaveRoom}
      />
    </main>
  );
}