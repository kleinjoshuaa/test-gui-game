import { Card } from "./Card";
import type { GameCard } from "../hooks/useGame";
import styles from "./Board.module.css";

type BoardProps = {
  cards: GameCard[];
  locked: boolean;
  onFlip: (cardId: string) => void;
};

export function Board({ cards, locked, onFlip }: BoardProps) {
  return (
    <div className={styles.board} role="grid" aria-label="Memory board">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={styles.cell}
          style={{ ["--i" as string]: index }}
          role="gridcell"
        >
          <Card {...card} disabled={locked} onFlip={onFlip} />
        </div>
      ))}
    </div>
  );
}
