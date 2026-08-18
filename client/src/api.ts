export type SessionCard = {
  id: string;
  symbolId: string;
  glyph: string;
  color: string;
};

export type Session = {
  sessionId: string;
  seed: string;
  cards: SessionCard[];
  startedAt: string;
  playerName: string;
};

export type LeaderboardEntry = {
  id: string;
  playerName: string;
  moves: number;
  durationMs: number;
  completedAt: string;
};

async function parseJson<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    throw new Error(fallback);
  }
  return (await res.json()) as T;
}

export async function createSession(playerName: string): Promise<Session> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName }),
  });
  return parseJson<Session>(res, "Failed to start a session");
}

export async function completeSession(
  sessionId: string,
  body: { moves: number; durationMs: number },
): Promise<void> {
  const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Failed to submit score");
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch("/api/leaderboard");
  return parseJson<LeaderboardEntry[]>(res, "Failed to load leaderboard");
}
