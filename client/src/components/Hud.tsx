import { useEffect, useState } from "react";
import { formatDuration } from "../format";
import styles from "./Hud.module.css";

type HudProps = {
  moves: number;
  startedAt: number | null;
};

export function Hud({ moves, startedAt }: HudProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = startedAt === null ? 0 : now - startedAt;

  return (
    <div className={styles.hud} aria-live="polite">
      <div className={styles.stat}>
        <span className={styles.label}>Moves</span>
        <span className={styles.value}>{moves}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Time</span>
        <span className={styles.value}>{formatDuration(elapsed)}</span>
      </div>
    </div>
  );
}
