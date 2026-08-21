import { Card } from "./Card";
import type { GameCard } from "../hooks/useGame";
import styles from "./Board.module.css";

type BoardProps = {
  cards: GameCard[];
  rows: number;
  cols: number;
  locked: boolean;
  onFlip: (cardId: string) => void;
};

export function Board({ cards, rows, cols, locked, onFlip }: BoardProps) {
  return (
    <div
      className={styles.board}
      role="grid"
      aria-label="Memory board"
      aria-rowcount={rows}
      aria-colcount={cols}
      style={{ ["--board-cols" as string]: cols }}
    >
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={styles.cell}
          style={{ ["--i" as string]: index }}
          role="gridcell"
          aria-rowindex={Math.floor(index / cols) + 1}
          aria-colindex={(index % cols) + 1}
        >
          <Card {...card} disabled={locked} onFlip={onFlip} />
        </div>
      ))}
    </div>
  );
}
