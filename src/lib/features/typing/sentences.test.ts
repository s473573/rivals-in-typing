import {describe, it, expect} from 'vitest'
import { pickSentence, SENTENCE_POOL } from './sentences';

describe("sentence picker", () => {
  it("behaves deterministically", () => {
    const id = 1
    const s1 = pickSentence(id, SENTENCE_POOL)
    const s2 = pickSentence(id, SENTENCE_POOL)
    
    expect(s1).toEqual(s2)
  })
  
  it('throws on empty pool', () => {
    expect(() => pickSentence(0, [])).toThrow();
  });

  it('throws on negative roundId', () => {
    expect(() => pickSentence(-1, SENTENCE_POOL)).toThrow();
  });

  it('handles large roundIds', () => {
    const s = pickSentence(1_000_000, SENTENCE_POOL);
    expect(SENTENCE_POOL).toContain(s.text);
  });

  it('supports custom pools', () => {
    const pool = ['a', 'b', 'c'] as const;
    const s = pickSentence(1, pool);
    expect(pool).toContain(s.text);
  });
})