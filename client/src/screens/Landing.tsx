import { useState, type FormEvent } from "react";
import styles from "./Landing.module.css";

type LandingProps = {
  initialName?: string;
  pending?: boolean;
  error?: string | null;
  onStart: (name: string) => void;
};

export function Landing({ initialName = "", pending = false, error, onStart }: LandingProps) {
  const [name, setName] = useState(initialName);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending) {
      return;
    }
    onStart(trimmed);
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
        <button className={styles.cta} type="submit" disabled={pending || name.trim().length === 0}>
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
