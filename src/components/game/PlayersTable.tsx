'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type PlayerRow = {
  playerId: string;
  displayName: string;
  typedPreview: string;
  wpm: number;
  accuracy: number;
};

function formatWpm(wpm: number) {
  if (!Number.isFinite(wpm)) return '0';
  return wpm.toFixed(0);
}

function formatAcc(acc: number) {
  if (!Number.isFinite(acc)) return '0.00';
  return acc.toFixed(2);
}

export function PlayersTable({ rows }: { rows: PlayerRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[48%]">Live progress</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">WPM</TableHead>
          <TableHead className="text-right">Accuracy</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
              No players yet. Open another tab to join the duel.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((r) => (
            <TableRow key={r.playerId}>
              <TableCell className="font-mono text-sm">{r.typedPreview}</TableCell>
              <TableCell className="font-medium">{r.displayName}</TableCell>
              <TableCell className="text-right font-mono">{formatWpm(r.wpm)}</TableCell>
              <TableCell className="text-right font-mono">{formatAcc(r.accuracy)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}