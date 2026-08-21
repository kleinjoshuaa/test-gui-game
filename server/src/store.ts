import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import { compareScores } from "./game.js";
import {
  DEFAULT_BOARD_COLS,
  DEFAULT_BOARD_ROWS,
  type BoardSize,
} from "./boardConfig.js";

export type Session = {
  id: string;
  playerName: string;
  seed: string;
  startedAt: number;
  rows: number;
  cols: number;
  completedAt?: number;
  moves?: number;
  durationMs?: number;
};

export type ScoreEntry = {
  id: string;
  playerName: string;
  moves: number;
  durationMs: number;
  completedAt: number;
  rows: number;
  cols: number;
};

type Persisted = {
  sessions: Session[];
  scores: ScoreEntry[];
};

/** Open (incomplete) sessions retained on disk. Oldest are dropped first. */
export const MAX_OPEN_SESSIONS = 100;

const DEFAULT_DATA_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data",
);

export class Store {
  private readonly dataDir: string;
  private readonly scoresPath: string;
  private readonly tmpPath: string;
  private sessions = new Map<string, Session>();
  private scores: ScoreEntry[] = [];

  constructor(dataDir = DEFAULT_DATA_DIR) {
    this.dataDir = dataDir;
    this.scoresPath = path.join(dataDir, "scores.json");
    this.tmpPath = path.join(dataDir, "scores.json.tmp");
    this.load();
  }

  private load(): void {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
    if (!existsSync(this.scoresPath)) {
      this.save();
      return;
    }
    try {
      const parsed = JSON.parse(readFileSync(this.scoresPath, "utf8")) as Partial<Persisted>;
      this.scores = Array.isArray(parsed.scores)
        ? parsed.scores.map((score) => withBoardSize(score))
        : [];
      const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
      // Drop completed leftovers from older store versions; scores already hold them.
      this.sessions = new Map(
        sessions
          .filter((session) => session.completedAt === undefined)
          .map((session) => {
            const sized = withBoardSize(session);
            return [sized.id, sized];
          }),
      );
      this.pruneOpenSessions();
    } catch {
      this.scores = [];
      this.sessions = new Map();
    }
  }

  /** Write via temp file + rename so a crash mid-write cannot truncate the store. */
  private save(): void {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
    const payload: Persisted = {
      sessions: [...this.sessions.values()],
      scores: this.scores,
    };
    const json = JSON.stringify(payload, null, 2);
    writeFileSync(this.tmpPath, json, "utf8");
    try {
      renameSync(this.tmpPath, this.scoresPath);
    } catch {
      // Rare: some platforms refuse rename-over-existing; fall back to replace.
      if (existsSync(this.scoresPath)) {
        unlinkSync(this.scoresPath);
      }
      renameSync(this.tmpPath, this.scoresPath);
    }
  }

  private pruneOpenSessions(): void {
    if (this.sessions.size <= MAX_OPEN_SESSIONS) {
      return;
    }
    const ordered = [...this.sessions.values()].sort((a, b) => a.startedAt - b.startedAt);
    const overflow = ordered.length - MAX_OPEN_SESSIONS;
    for (let i = 0; i < overflow; i++) {
      this.sessions.delete(ordered[i]!.id);
    }
  }

  createSession(playerName: string, seed: string, size: BoardSize): Session {
    const session: Session = {
      id: nanoid(),
      playerName,
      seed,
      startedAt: Date.now(),
      rows: size.rows,
      cols: size.cols,
    };
    this.sessions.set(session.id, session);
    this.pruneOpenSessions();
    this.save();
    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  completeSession(id: string, moves: number, durationMs: number): ScoreEntry {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error("Session not found");
    }
    if (session.completedAt !== undefined) {
      throw new Error("Session already completed");
    }

    const completedAt = Date.now();
    const entry: ScoreEntry = {
      id: session.id,
      playerName: session.playerName,
      moves,
      durationMs,
      completedAt,
      rows: session.rows,
      cols: session.cols,
    };
    this.scores.push(entry);
    // Score is durable; drop the open session so the file stays bounded.
    this.sessions.delete(id);
    this.save();
    return entry;
  }

  getLeaderboard(limit = 10): ScoreEntry[] {
    return [...this.scores].sort(compareScores).slice(0, limit);
  }

  /** Test helper: open-session count after pruning rules. */
  get openSessionCount(): number {
    return this.sessions.size;
  }

  /** Test helper: raw score count. */
  get scoreCount(): number {
    return this.scores.length;
  }
}

export const store = new Store();

function dimensionOrDefault(value: number | undefined, fallback: number): number {
  return Number.isInteger(value) && value !== undefined ? value : fallback;
}

function withBoardSize<T extends { rows?: number; cols?: number }>(value: T): T & BoardSize {
  return {
    ...value,
    rows: dimensionOrDefault(value.rows, DEFAULT_BOARD_ROWS),
    cols: dimensionOrDefault(value.cols, DEFAULT_BOARD_COLS),
  };
}
