import cors from "cors";
import express, { type Request, type Response } from "express";
import { nanoid } from "nanoid";
import { boardSizeFromEnv, resolveBoardSize } from "./boardConfig.js";
import { createBoard } from "./game.js";
import { store } from "./store.js";
import { SYMBOLS } from "./symbols.js";

const PORT = Number(process.env.PORT) || 3001;
const VITE_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const defaultBoardSize = boardSizeFromEnv(process.env, SYMBOLS.length);

const app = express();
app.use(cors({ origin: VITE_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post("/api/sessions", (req: Request, res: Response) => {
  const rawName = req.body?.playerName;
  const playerName = typeof rawName === "string" ? rawName.trim() : "";
  if (playerName.length < 1 || playerName.length > 24) {
    res.status(400).json({ error: "playerName must be 1–24 characters after trimming" });
    return;
  }

  const board = resolveBoardSize(
    { rows: req.body?.rows, cols: req.body?.cols },
    defaultBoardSize,
    SYMBOLS.length,
  );
  if (!board.ok) {
    res.status(400).json({ error: board.error });
    return;
  }

  const seed = nanoid();
  const session = store.createSession(playerName, seed, board.size);
  const cards = createBoard(seed, board.size);

  res.status(201).json({
    sessionId: session.id,
    seed: session.seed,
    cards,
    rows: board.size.rows,
    cols: board.size.cols,
    startedAt: session.startedAt,
    playerName: session.playerName,
  });
});

app.post("/api/sessions/:id/complete", (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ error: "Session id is required" });
    return;
  }

  const moves = req.body?.moves;
  const durationMs = req.body?.durationMs;
  if (!Number.isInteger(moves) || moves <= 0) {
    res.status(400).json({ error: "moves must be a positive integer" });
    return;
  }
  if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs <= 0) {
    res.status(400).json({ error: "durationMs must be a positive number" });
    return;
  }

  try {
    const score = store.completeSession(id, moves, durationMs);
    res.json(score);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to complete session";
    const status = message === "Session not found" ? 404 : 409;
    res.status(status).json({ error: message });
  }
});

app.get("/api/leaderboard", (_req: Request, res: Response) => {
  res.json(store.getLeaderboard(10));
});

app.listen(PORT, () => {
  console.log(`Memory Mosaic API listening on http://localhost:${PORT}`);
});
