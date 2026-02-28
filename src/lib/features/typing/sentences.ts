export const SENTENCE_POOL: readonly string[] = [
  "I tap each key like a tiny drum, and the room turns into a calm spell.",
  "Breathe in, breathe out, and let the letters line up like fireflies in a jar.",
  "My fingers learn the path, and the path becomes a soft, steady river.",
  "I chase my best time, not my rival, and the chase stays kind.",
  "Click, clack - each sound is a charm that keeps my focus bright.",
  "I write a simple incantation: steady hands, clear mind, smooth rhythm.",
  "The cursor is a lantern; I follow it through a hallway of glowing words.",
  "I make mistakes like sparks, then sweep them away and keep the flame.",
  "I type as if stitching cloth: one clean thread, one calm stitch, one more.",
  "My posture is a tower, my breath is wind, my keys are bells.",
  "I keep the pace playful, and the pace becomes power.",
  "The scoreboard is just a mirror; I smile and polish it with practice.",
  "Each sentence is a small workshop: sand the edges, fit the pieces, finish the line.",
  "I let my wrists float, and the keyboard feels like warm stone.",
  "Faster is fine, smoother is better, and steady is the secret gate.",
  "I pour my attention into every letter until the noise outside fades to mist.",
  "The words arrive in a line, and I ride them like a broom over moonlit roofs.",
  "I keep my eyes soft and my hands sure, and the trance finds me.",
  "I race the clock with a grin, then bow to the calm I built.",
  "When I reach the final period, I land gently—and start again, brighter."
] as const;

type Sentence = {
  id: string,
  text: string  
}

export function pickSentence(
  roundId: number,
  pool: readonly string[] = SENTENCE_POOL
): Sentence {
  const mix_id = () => {
    return (roundId * 2654435761) % pool.length;
  } // golden ratio hash

  if (pool.length === 0)
    throw Error("Sentence pool must not be empty.")
  if (roundId < 0)
    throw Error("Round ID must be a positive number.")
  
  const len = pool.length;
  const idx = ((mix_id() % len) + len) % len
  return {
    id: `s_${idx}`,
    text: pool[idx]
  }
}