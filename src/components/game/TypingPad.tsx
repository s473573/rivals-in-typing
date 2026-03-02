'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  typed: string;
  setTyped: (next: string | ((prev: string) => string)) => void;
  disabled?: boolean;
  maxLen?: number;
};

function isTypingKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return false;
  // allow Backspace / Escape
  if (e.key === 'Backspace' || e.key === 'Escape') return true;
  // printable character
  return e.key.length === 1;
}

export function TypingPad({ typed, setTyped, disabled = false, maxLen }: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active || disabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isTypingKey(e)) return;

      if (e.key === 'Escape') {
        setActive(false);
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        setTyped((prev) => prev.slice(0, -1));
        return;
      }

      // printable
      e.preventDefault();
      const ch = e.key;

      setTyped((prev) => {
        if (typeof maxLen === 'number' && prev.length >= maxLen) return prev;
        return prev + ch;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, disabled, maxLen, setTyped]);

  const showCaret = active && !disabled;

  return (
    <Card
      className={`shadow-none ${active && !disabled ? 'ring-2 ring-ring' : ''}`}
      onClick={() => {
        if (!disabled) setActive(true);
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
          Typing Pad
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div
          className={`min-h-[84px] rounded-md border bg-background p-4 font-mono text-base leading-relaxed ${
            disabled ? 'opacity-70' : 'cursor-text'
          }`}
        >
          {typed.length === 0 ? (
            <span className="text-muted-foreground">
              {disabled ? 'Round complete — wait for the next sentence.' : 'Click here, then type. (Esc to stop)'}
            </span>
          ) : (
            <>
              <span>{typed}</span>
              {showCaret ? (
                <span className="ml-0.5 inline-block h-5 w-[1px] align-middle bg-foreground/70" />
              ) : null}
            </>
          )}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Tip: click once anywhere in the pad. Backspace works.
        </p>
      </CardContent>
    </Card>
  );
}