import type { GameCard } from "../hooks/useGame";
import styles from "./Card.module.css";

type CardProps = GameCard & {
  disabled?: boolean;
  onFlip: (cardId: string) => void;
};

export function Card({
  id,
  glyph,
  color,
  faceUp,
  matched,
  disabled,
  onFlip,
}: CardProps) {
  const revealed = faceUp || matched;
  const className = [
    styles.card,
    revealed ? styles.flipped : "",
  ]
    .filter(Boolean)
    .join(" ");

  const label = matched ? `Matched ${glyph}` : revealed ? glyph : "Hidden tile";

  return (
    <button
      type="button"
      className={styles.hit}
      onClick={() => onFlip(id)}
      disabled={disabled || matched || faceUp}
      aria-label={label}
      aria-pressed={revealed}
    >
      <div className={[styles.scene, matched ? styles.matched : ""].filter(Boolean).join(" ")}>
        <div className={className}>
          <div className={[styles.face, styles.back].join(" ")} aria-hidden="true" />
          <div
            className={[styles.face, styles.front].join(" ")}
            style={{ background: color }}
            aria-hidden="true"
          >
            <span className={styles.glyph}>{glyph}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
