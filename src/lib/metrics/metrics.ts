export type TypingSnapshot = {
  target: string;
  typed: string;
  elapsedMs: number;
};

export type TypingMetrics = {
  typedChars: number;
  correctChars: number;
  errorChars: number;
  elapsedMs: number;    
  accuracy: number;
  wpm: number;
};

/**
 * Counts how many characters match between target and typed at the same indices.
 * Only compares up to the shorter of the two strings.
 */
function _countCorrect(target: string, typed: string): number {
  const len = Math.min(target.length, typed.length);
  let count = 0;
  for(let i=0; i<len; i++) {
    if (target[i] == typed[i])
      count++      
  }
  return count
}

/**
 * Computes typing metrics from a snapshot (pure function).
 *
 * Notes:
 * - If typedChars is 0, accuracy is 1 (no mistakes yet).
 */
export function computeMetrics(input: TypingSnapshot): TypingMetrics {
  const elapsedMs =
    Number.isFinite(input.elapsedMs) && input.elapsedMs > 0 ? input.elapsedMs : 0;
  const typed = input.typed.length 

  const correct = _countCorrect(input.target, input.typed)
  const errors = typed - correct;
  const accuracy = typed === 0 ? 1 : correct / typed;
  
  const minutes = elapsedMs / 60000
  const wpm = minutes === 0 ? 0 : correct / 5 / minutes

  return {
    typedChars: typed,
    correctChars: correct,
    errorChars: errors,
    accuracy: accuracy,
    wpm: wpm,
    elapsedMs: elapsedMs
  };
}