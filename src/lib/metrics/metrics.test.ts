import { describe, expect, it } from 'vitest';
import { computeMetrics, TypingSnapshot } from './metrics';

const makeSnapshot = (overrides: Partial<TypingSnapshot> = {}): TypingSnapshot => ({
  elapsedMs: 0,
  typed: "",
  target: "the quick brown fox jumps over a lazy dog",
  ...overrides,
});

describe('metrics', () => {
  it('returns perfect accuracy at game init', () => {
    const metrics = computeMetrics(makeSnapshot());
    
    expect(metrics.elapsedMs).toBe(0)
    expect(metrics.accuracy).toBe(1)
  });
  
  it('counts input errors', () => {
    const snapshot = makeSnapshot({
      elapsedMs: 300,
      typed: "tha quick", // 'a' vs 'e'
    });
    const metrics = computeMetrics(snapshot);
    
    expect(metrics.typedChars).toBe(9);
    expect(metrics.correctChars).toBe(8);
    expect(metrics.errorChars).toBe(1);
    expect(metrics.accuracy).toBeCloseTo(8 / 9, 8);
  })
  
  it('correctly matches input to target keystrokes', () => {
    const snapshot = makeSnapshot({
      elapsedMs: 200,
      typed: "the quick",
    });
    const metrics = computeMetrics(snapshot);
    
    expect(metrics.typedChars).toBe(9)
    expect(metrics.correctChars).toBe(9)
    expect(metrics.accuracy).toBe(1)
    expect(metrics.errorChars).toBe(0)
  })
  
  it('considers extra chars as errors', () => {
    const typed = "the quickest brow";
    const snapshot = makeSnapshot({
      elapsedMs: 200,
      typed,
    });
    const metrics = computeMetrics(snapshot);
    
    expect(metrics.correctChars).toBe(9);
    expect(metrics.errorChars).toBe(typed.length - 9);
  })
  
  it("computes net WPM from correct chars and elapsed time", () => {
    const target = "a".repeat(25);
    const typed = "a".repeat(25);

    const metrics = computeMetrics({
      target,
      typed,
      elapsedMs: 60_000,
    });

    expect(metrics.correctChars).toBe(25);
    expect(metrics.wpm).toBeCloseTo(5, 8);
  });
});
