import { useState, type FormEvent } from "react";
import {
  DEFAULT_BOARD_COLS,
  DEFAULT_BOARD_ROWS,
  MAX_BOARD_DIM,
  MIN_BOARD_DIM,
  isValidBoardSize,
} from "../boardSize";
import styles from "./Landing.module.css";

type LandingProps = {
  initialName?: string;
  initialRows?: number;
  initialCols?: number;
  pending?: boolean;
  error?: string | null;
  onStart: (name: string, board: { rows: number; cols: number }) => void;
};

export function Landing({
  initialName = "",
  initialRows = DEFAULT_BOARD_ROWS,
  initialCols = DEFAULT_BOARD_COLS,
  pending = false,
  error,
  onStart,
}: LandingProps) {
  const [name, setName] = useState(initialName);
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const sizeOk = isValidBoardSize(rows, cols);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending || !sizeOk) {
      return;
    }
    onStart(trimmed, { rows, cols });
  }

  return (
    <main className={styles.hero}>
      <h1 className={styles.brand}>Memory Mosaic</h1>
      <p className={styles.tagline}>Flip tiles. Find pairs. Finish the mosaic.</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          <span className="sr-only">Your name</span>
          <input
            className={styles.input}
            name="playerName"
            autoComplete="nickname"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={pending}
            required
            maxLength={32}
          />
        </label>
        <div className={styles.sizeRow}>
          <label className={styles.sizeField}>
            <span>Rows</span>
            <input
              className={styles.input}
              name="rows"
              type="number"
              min={MIN_BOARD_DIM}
              max={MAX_BOARD_DIM}
              value={rows}
              onChange={(event) => setRows(Number(event.target.value))}
              disabled={pending}
              required
            />
          </label>
          <label className={styles.sizeField}>
            <span>Columns</span>
            <input
              className={styles.input}
              name="cols"
              type="number"
              min={MIN_BOARD_DIM}
              max={MAX_BOARD_DIM}
              value={cols}
              onChange={(event) => setCols(Number(event.target.value))}
              disabled={pending}
              required
            />
          </label>
        </div>
        {!sizeOk ? (
          <p className={styles.error} role="alert">
            Pick rows and columns from {MIN_BOARD_DIM}–{MAX_BOARD_DIM} with an even number of tiles.
          </p>
        ) : null}
        <button
          className={styles.cta}
          type="submit"
          disabled={pending || name.trim().length === 0 || !sizeOk}
        >
          {pending ? "Starting…" : "Start"}
        </button>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </main>
  );
}
