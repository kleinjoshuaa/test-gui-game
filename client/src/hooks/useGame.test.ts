import { describe, expect, it } from "vitest";
import {
  allMatched,
  applyFlip,
  hideCards,
  initCards,
  unmatchedFaceUp,
  type GameCard,
} from "./useGame";

function deck(): GameCard[] {
  return initCards([
    { id: "1", symbolId: "wave", glyph: "◈", color: "#2ec4b6" },
    { id: "2", symbolId: "wave", glyph: "◈", color: "#2ec4b6" },
    { id: "3", symbolId: "sun", glyph: "◉", color: "#ff6b4a" },
    { id: "4", symbolId: "sun", glyph: "◉", color: "#ff6b4a" },
  ]);
}

describe("applyFlip", () => {
  it("ignores flips while locked", () => {
    expect(applyFlip(deck(), "1", true)).toEqual({ type: "noop" });
  });

  it("ignores unknown, matched, and already face-up cards", () => {
    const cards = deck();
    cards[0] = { ...cards[0]!, faceUp: true };
    cards[2] = { ...cards[2]!, matched: true, faceUp: true };

    expect(applyFlip(cards, "missing", false).type).toBe("noop");
    expect(applyFlip(cards, "1", false).type).toBe("noop");
    expect(applyFlip(cards, "3", false).type).toBe("noop");
  });

  it("reveals the first card of a pair without incrementing a match outcome", () => {
    const result = applyFlip(deck(), "1", false);
    expect(result.type).toBe("first");
    if (result.type !== "first") {
      return;
    }
    expect(result.cards.find((card) => card.id === "1")?.faceUp).toBe(true);
    expect(unmatchedFaceUp(result.cards)).toHaveLength(1);
  });

  it("marks a matching pair and reports a win when the board is clear", () => {
    let cards = deck();
    const first = applyFlip(cards, "1", false);
    expect(first.type).toBe("first");
    if (first.type !== "first") {
      return;
    }
    cards = first.cards;

    const second = applyFlip(cards, "2", false);
    expect(second.type).toBe("match");
    if (second.type !== "match") {
      return;
    }
    expect(second.won).toBe(false);
    expect(second.cards.filter((card) => card.matched)).toHaveLength(2);

    const third = applyFlip(second.cards, "3", false);
    expect(third.type).toBe("first");
    if (third.type !== "first") {
      return;
    }

    const last = applyFlip(third.cards, "4", false);
    expect(last.type).toBe("match");
    if (last.type !== "match") {
      return;
    }
    expect(last.won).toBe(true);
    expect(allMatched(last.cards)).toBe(true);
  });

  it("treats a mismatch as a pair attempt and returns ids to hide", () => {
    const first = applyFlip(deck(), "1", false);
    expect(first.type).toBe("first");
    if (first.type !== "first") {
      return;
    }

    const miss = applyFlip(first.cards, "3", false);
    expect(miss.type).toBe("mismatch");
    if (miss.type !== "mismatch") {
      return;
    }
    expect(miss.hideIds).toEqual(["1", "3"]);
    expect(miss.cards.find((card) => card.id === "3")?.faceUp).toBe(true);

    const hidden = hideCards(miss.cards, miss.hideIds);
    expect(hidden.every((card) => !card.faceUp)).toBe(true);
  });
});
