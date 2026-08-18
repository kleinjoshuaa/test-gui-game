import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import { compareScores } from "./game.js";

export type Session = {
  id: string;
  playerName: string;
  seed: string;
  startedAt: number;
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
};

type Persisted = {
  sessions: Session[];
  scores: ScoreEntry[];
};

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
const SCORES_PATH = path.join(DATA_DIR, "scores.json");

export class Store {
  private sessions = new Map<string, Session>();
  private scores: ScoreEntry[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!existsSync(SCORES_PATH)) {
      this.save();
      return;
    }
    try {
      const parsed = JSON.parse(readFileSync(SCORES_PATH, "utf8")) as Partial<Persisted>;
      this.scores = Array.isArray(parsed.scores) ? parsed.scores : [];
      const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
      this.sessions = new Map(sessions.map((session) => [session.id, session]));
    } catch {
      this.scores = [];
      this.sessions = new Map();
    }
  }

  private save(): void {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const payload: Persisted = {
      sessions: [...this.sessions.values()],
      scores: this.scores,
    };
    writeFileSync(SCORES_PATH, JSON.stringify(payload, null, 2), "utf8");
  }

  createSession(playerName: string, seed: string): Session {
    const session: Session = {
      id: nanoid(),
      playerName,
      seed,
      startedAt: Date.now(),
    };
    this.sessions.set(session.id, session);
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
    session.completedAt = completedAt;
    session.moves = moves;
    session.durationMs = durationMs;

    const entry: ScoreEntry = {
      id: session.id,
      playerName: session.playerName,
      moves,
      durationMs,
      completedAt,
    };
    this.scores.push(entry);
    this.save();
    return entry;
  }

  getLeaderboard(limit = 10): ScoreEntry[] {
    return [...this.scores].sort(compareScores).slice(0, limit);
  }
}

export const store = new Store();
