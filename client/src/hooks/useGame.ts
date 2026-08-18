import { useCallback, useEffect, useRef, useState } from "react";
import type { SessionCard } from "../api";

export type GameCard = SessionCard & {
  faceUp: boolean;
  matched: boolean;
};

export type GameStatus = "idle" | "playing" | "won";

export type FlipResult =
  | { type: "noop" }
  | { type: "first"; cards: GameCard[] }
  | { type: "match"; cards: GameCard[]; won: boolean }
  | { type: "mismatch"; cards: GameCard[]; hideIds: [string, string] };

const MISMATCH_MS = 700;

export function initCards(apiCards: SessionCard[]): GameCard[] {
  return apiCards.map((card) => ({ ...card, faceUp: false, matched: false }));
}

export function unmatchedFaceUp(cards: GameCard[]): GameCard[] {
  return cards.filter((card) => card.faceUp && !card.matched);
}

export function allMatched(cards: GameCard[]): boolean {
  return cards.length > 0 && cards.every((card) => card.matched);
}

export function hideCards(cards: GameCard[], ids: readonly string[]): GameCard[] {
  const hide = new Set(ids);
  return cards.map((card) =>
    hide.has(card.id) && !card.matched ? { ...card, faceUp: false } : card,
  );
}

export function applyFlip(cards: GameCard[], cardId: string, locked: boolean): FlipResult {
  if (locked) {
    return { type: "noop" };
  }

  const target = cards.find((card) => card.id === cardId);
  if (!target || target.matched || target.faceUp) {
    return { type: "noop" };
  }

  const open = unmatchedFaceUp(cards);
  const next = cards.map((card) => (card.id === cardId ? { ...card, faceUp: true } : card));

  if (open.length === 0) {
    return { type: "first", cards: next };
  }

  if (open.length === 1) {
    const first = open[0];
    if (!first) {
      return { type: "noop" };
    }
    if (first.symbolId === target.symbolId) {
      const matched = next.map((card) =>
        card.id === first.id || card.id === target.id
          ? { ...card, faceUp: true, matched: true }
          : card,
      );
      return { type: "match", cards: matched, won: allMatched(matched) };
    }
    return { type: "mismatch", cards: next, hideIds: [first.id, target.id] };
  }

  return { type: "noop" };
}

type UseGameInput = {
  sessionId: string;
  cards: SessionCard[];
} | null;

export function useGame(input: UseGameInput) {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const cardsRef = useRef(cards);
  const lockedRef = useRef(locked);
  const statusRef = useRef(status);
  const timerRef = useRef<number | null>(null);

  cardsRef.current = cards;
  lockedRef.current = locked;
  statusRef.current = status;

  const clearHideTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearHideTimer();
    if (!input) {
      setCards([]);
      setMoves(0);
      setLocked(false);
      setStatus("idle");
      setStartedAt(null);
      return;
    }
    setCards(initCards(input.cards));
    setMoves(0);
    setLocked(false);
    setStatus("playing");
    setStartedAt(Date.now());
  }, [input?.sessionId, clearHideTimer]);

  useEffect(() => clearHideTimer, [clearHideTimer]);

  const flip = useCallback(
    (cardId: string) => {
      if (statusRef.current !== "playing") {
        return;
      }

      const result = applyFlip(cardsRef.current, cardId, lockedRef.current);
      if (result.type === "noop") {
        return;
      }

      setCards(result.cards);
      cardsRef.current = result.cards;

      if (result.type === "first") {
        return;
      }

      setMoves((current) => current + 1);

      if (result.type === "match") {
        if (result.won) {
          setStatus("won");
          statusRef.current = "won";
        }
        return;
      }

      setLocked(true);
      lockedRef.current = true;
      clearHideTimer();
      timerRef.current = window.setTimeout(() => {
        setCards((current) => {
          const hidden = hideCards(current, result.hideIds);
          cardsRef.current = hidden;
          return hidden;
        });
        setLocked(false);
        lockedRef.current = false;
        timerRef.current = null;
      }, MISMATCH_MS);
    },
    [clearHideTimer],
  );

  return { cards, moves, locked, status, startedAt, flip };
}
