import { describe, expect, it } from "vitest";
import { isValidBoardSize } from "./boardSize";

describe("isValidBoardSize", () => {
  it("accepts the default 4×4 board", () => {
    expect(isValidBoardSize(4, 4)).toBe(true);
  });

  it("accepts even tile counts in range", () => {
    expect(isValidBoardSize(2, 3)).toBe(true);
    expect(isValidBoardSize(6, 6)).toBe(true);
  });

  it("rejects odd tile counts and out-of-range sizes", () => {
    expect(isValidBoardSize(3, 3)).toBe(false);
    expect(isValidBoardSize(1, 4)).toBe(false);
    expect(isValidBoardSize(4, 7)).toBe(false);
  });
});
