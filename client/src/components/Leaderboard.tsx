import type { LeaderboardEntry } from "../api";
import { formatDuration } from "../format";
import styles from "./Leaderboard.module.css";

type LeaderboardProps = {
  entries: LeaderboardEntry[];
};

export function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <section className={styles.wrap} aria-label="Leaderboard">
      <h2 className={styles.title}>Leaderboard</h2>
      {entries.length === 0 ? (
        <p className={styles.empty}>No scores yet. Yours could be first.</p>
      ) : (
        <ol className={styles.list}>
          {entries.map((entry, index) => (
            <li key={entry.id} className={styles.row}>
              <span className={styles.rank}>{index + 1}</span>
              <span className={styles.name}>{entry.playerName}</span>
              <span className={styles.meta}>{entry.moves} moves</span>
              <span className={styles.meta}>{formatDuration(entry.durationMs)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
