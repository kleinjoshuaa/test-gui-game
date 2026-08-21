import { Board } from "../components/Board";
import { Hud } from "../components/Hud";
import type { GameCard } from "../hooks/useGame";
import styles from "./Play.module.css";

type PlayProps = {
  cards: GameCard[];
  rows: number;
  cols: number;
  moves: number;
  startedAt: number | null;
  locked: boolean;
  onFlip: (cardId: string) => void;
  onRestart: () => void;
};

export function Play({
  cards,
  rows,
  cols,
  moves,
  startedAt,
  locked,
  onFlip,
  onRestart,
}: PlayProps) {
  return (
    <main className={styles.play} style={{ ["--board-cols" as string]: cols }}>
      <div className={styles.top}>
        <Hud moves={moves} startedAt={startedAt} />
        <button type="button" className={styles.restart} onClick={onRestart}>
          Restart
        </button>
      </div>
      <Board cards={cards} rows={rows} cols={cols} locked={locked} onFlip={onFlip} />
    </main>
  );
}
