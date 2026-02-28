import { describe, expect, it } from 'vitest';
import { getRoundEndsAtMs, getRoundId, getRoundState, ROUND_MS } from './roundClock';

describe('roundClock', () => {
  describe('getRoundId', () => {
    it('throws when roundMs <= 0', () => {
      expect(() => getRoundId(0, 0)).toThrow();
      expect(() => getRoundId(0, -1)).toThrow();
    });

    it('computes round id at boundaries', () => {
      expect(getRoundId(0)).toBe(0);
      expect(getRoundId(ROUND_MS - 1)).toBe(0);
      expect(getRoundId(ROUND_MS)).toBe(1);
      expect(getRoundId(ROUND_MS + 1)).toBe(1);
    });

    it('works with custom roundMs', () => {
      const ms = 10_000;
      expect(getRoundId(0, ms)).toBe(0);
      expect(getRoundId(ms - 1, ms)).toBe(0);
      expect(getRoundId(ms, ms)).toBe(1);
      expect(getRoundId(2 * ms + 123, ms)).toBe(2);
    });
  });

  describe('getRoundEndsAtMs', () => {
    it('throws when roundMs <= 0', () => {
      expect(() => getRoundEndsAtMs(0, 0)).toThrow();
      expect(() => getRoundEndsAtMs(0, -1)).toThrow();
    });

    it('computes end timestamp for a round id', () => {
      expect(getRoundEndsAtMs(0)).toBe(ROUND_MS);
      expect(getRoundEndsAtMs(1)).toBe(2 * ROUND_MS);
      expect(getRoundEndsAtMs(2)).toBe(3 * ROUND_MS);
    });

    it('works with custom roundMs', () => {
      const ms = 10_000;
      expect(getRoundEndsAtMs(0, ms)).toBe(10_000);
      expect(getRoundEndsAtMs(5, ms)).toBe(60_000);
    });
  });

  describe('getRoundState', () => {
    it('returns correct initial state at now=0', () => {
      const s = getRoundState(0);
      expect(s.roundId).toBe(0);
      expect(s.endsAt).toBe(ROUND_MS);
      expect(s.timeLeft).toBe(ROUND_MS);
      expect(s.progress).toBeCloseTo(0);
    });

    it('returns correct state near end of round', () => {
      const s = getRoundState(ROUND_MS - 1);
      expect(s.roundId).toBe(0);
      expect(s.endsAt).toBe(ROUND_MS);
      expect(s.timeLeft).toBe(1);
      expect(s.progress).toBeCloseTo(1 - 1 / ROUND_MS);
    });

    it('rolls over to next round exactly at boundary', () => {
      const s = getRoundState(ROUND_MS);
      expect(s.roundId).toBe(1);
      expect(s.endsAt).toBe(2 * ROUND_MS);
      expect(s.timeLeft).toBe(ROUND_MS);
      expect(s.progress).toBeCloseTo(0);
    });

    it('clamps timeLeft to [0, roundMs] and progress to [0, 1]', () => {
      // far in the future within some round
      const s = getRoundState(123_456_789);
      expect(s.timeLeft).toBeGreaterThanOrEqual(0);
      expect(s.timeLeft).toBeLessThanOrEqual(ROUND_MS);
      expect(s.progress).toBeGreaterThanOrEqual(0);
      expect(s.progress).toBeLessThanOrEqual(1);
    });

    it('uses custom roundMs consistently', () => {
      const ms = 10_000;

      // At now=10_000, we should be in round 1 for ms=10_000.
      const s = getRoundState(10_000, ms);

      expect(s.roundId).toBe(1);
      expect(s.endsAt).toBe(20_000);
      expect(s.timeLeft).toBe(10_000);
      expect(s.progress).toBeCloseTo(0);
    });
  });
});