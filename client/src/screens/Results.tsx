import { Leaderboard } from "../components/Leaderboard";
import type { LeaderboardEntry } from "../api";
import { formatDuration } from "../format";
import styles from "./Results.module.css";

type ResultsProps = {
  playerName: string;
  moves: number;
  durationMs: number;
  entries: LeaderboardEntry[];
  pending?: boolean;
  onPlayAgain: () => void;
};

export function Results({
  playerName,
  moves,
  durationMs,
  entries,
  pending = false,
  onPlayAgain,
}: ResultsProps) {
  return (
    <main className={styles.wrap}>
      <p className={styles.kicker}>Board cleared</p>
      <h1 className={styles.title}>Nice match, {playerName}</h1>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Moves</span>
          <strong className={styles.value}>{moves}</strong>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Time</span>
          <strong className={styles.value}>{formatDuration(durationMs)}</strong>
        </div>
      </div>
      <button type="button" className={styles.cta} onClick={onPlayAgain} disabled={pending}>
        {pending ? "Dealing…" : "Play again"}
      </button>
      <Leaderboard entries={entries} />
    </main>
  );
}
