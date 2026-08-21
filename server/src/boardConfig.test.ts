import { describe, expect, it } from "vitest";
import {
  DEFAULT_BOARD_COLS,
  DEFAULT_BOARD_ROWS,
  boardSizeFromEnv,
  resolveBoardSize,
} from "./boardConfig.js";

const defaults = { rows: DEFAULT_BOARD_ROWS, cols: DEFAULT_BOARD_COLS };

describe("resolveBoardSize", () => {
  it("uses defaults when rows and cols are omitted", () => {
    expect(resolveBoardSize({}, defaults, 18)).toEqual({
      ok: true,
      size: { rows: 4, cols: 4 },
    });
  });

  it("accepts a smaller even board", () => {
    expect(resolveBoardSize({ rows: 2, cols: 3 }, defaults, 18)).toEqual({
      ok: true,
      size: { rows: 2, cols: 3 },
    });
  });

  it("rejects odd tile counts", () => {
    const result = resolveBoardSize({ rows: 3, cols: 3 }, defaults, 18);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error).toMatch(/even/);
  });

  it("rejects out-of-range dimensions", () => {
    expect(resolveBoardSize({ rows: 1, cols: 4 }, defaults, 18).ok).toBe(false);
    expect(resolveBoardSize({ rows: 4, cols: 7 }, defaults, 18).ok).toBe(false);
  });

  it("rejects boards that need more pairs than available", () => {
    const result = resolveBoardSize({ rows: 6, cols: 6 }, defaults, 8);
    expect(result.ok).toBe(false);
  });

  it("parses integer strings", () => {
    expect(resolveBoardSize({ rows: "2", cols: "4" }, defaults, 18)).toEqual({
      ok: true,
      size: { rows: 2, cols: 4 },
    });
  });
});

describe("boardSizeFromEnv", () => {
  it("falls back to 4×4 when env is unset", () => {
    expect(boardSizeFromEnv({}, 18)).toEqual({ rows: 4, cols: 4 });
  });

  it("reads BOARD_ROWS and BOARD_COLS", () => {
    expect(boardSizeFromEnv({ BOARD_ROWS: "2", BOARD_COLS: "4" }, 18)).toEqual({
      rows: 2,
      cols: 4,
    });
  });

  it("throws when env values are invalid", () => {
    expect(() => boardSizeFromEnv({ BOARD_ROWS: "3", BOARD_COLS: "3" }, 18)).toThrow(
      /BOARD_ROWS/,
    );
  });
});
