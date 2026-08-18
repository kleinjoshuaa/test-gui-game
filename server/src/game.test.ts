import { describe, expect, it } from "vitest";
import { compareScores, createBoard } from "./game.js";
import { SYMBOLS } from "./symbols.js";

describe("createBoard", () => {
  it("produces identical card order for the same seed", () => {
    const a = createBoard("seed-alpha");
    const b = createBoard("seed-alpha");
    expect(a).toEqual(b);
  });

  it("produces different orders for different seeds", () => {
    const a = createBoard("seed-alpha");
    const b = createBoard("seed-beta");
    expect(a.map((card) => card.id)).not.toEqual(b.map((card) => card.id));
  });

  it("has 16 cards and exactly 2 of each symbolId", () => {
    const board = createBoard("seed-alpha");
    expect(board).toHaveLength(16);
    expect(SYMBOLS).toHaveLength(8);

    const counts = new Map<string, number>();
    for (const card of board) {
      counts.set(card.symbolId, (counts.get(card.symbolId) ?? 0) + 1);
    }

    expect(counts.size).toBe(8);
    for (const symbol of SYMBOLS) {
      expect(counts.get(symbol.id)).toBe(2);
    }
  });
});

describe("compareScores", () => {
  it("prefers lower duration, then fewer moves", () => {
    expect(compareScores({ durationMs: 1000, moves: 20 }, { durationMs: 2000, moves: 8 })).toBeLessThan(
      0,
    );
    expect(compareScores({ durationMs: 1000, moves: 20 }, { durationMs: 1000, moves: 8 })).toBeGreaterThan(
      0,
    );
  });
});
