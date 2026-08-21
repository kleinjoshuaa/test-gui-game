import {
  DEFAULT_BOARD_COLS,
  DEFAULT_BOARD_ROWS,
  resolveBoardSize,
  type BoardSize,
} from "./boardConfig.js";
import { SYMBOLS } from "./symbols.js";

export type Card = {
  id: string;
  symbolId: string;
  glyph: string;
  color: string;
};

export type ScoreLike = {
  durationMs: number;
  moves: number;
};

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — same seed always yields the same sequence. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const current = arr[i];
    const swap = arr[j];
    if (current === undefined || swap === undefined) continue;
    arr[i] = swap;
    arr[j] = current;
  }
  return arr;
}

const DEFAULT_SIZE: BoardSize = { rows: DEFAULT_BOARD_ROWS, cols: DEFAULT_BOARD_COLS };

/** Deterministic board: `rows × cols / 2` symbol pairs shuffled from `seed`. */
export function createBoard(seed: string, size: BoardSize = DEFAULT_SIZE): Card[] {
  const resolved = resolveBoardSize(size, DEFAULT_SIZE, SYMBOLS.length);
  if (!resolved.ok) {
    throw new Error(resolved.error);
  }

  const pairCount = (resolved.size.rows * resolved.size.cols) / 2;
  const selected = SYMBOLS.slice(0, pairCount);
  const pairs: Card[] = selected.flatMap((symbol) =>
    [0, 1].map((copy) => ({
      id: `${symbol.id}-${copy}`,
      symbolId: symbol.id,
      glyph: symbol.glyph,
      color: symbol.color,
    })),
  );
  return shuffle(pairs, mulberry32(hashSeed(seed)));
}

/** Lower duration wins; ties break on fewer moves. */
export function compareScores(a: ScoreLike, b: ScoreLike): number {
  if (a.durationMs !== b.durationMs) {
    return a.durationMs - b.durationMs;
  }
  return a.moves - b.moves;
}
