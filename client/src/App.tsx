import { useEffect, useMemo, useRef, useState } from "react";
import {
  completeSession,
  createSession,
  fetchLeaderboard,
  type LeaderboardEntry,
  type Session,
} from "./api";
import { useGame } from "./hooks/useGame";
import { Landing } from "./screens/Landing";
import { Play } from "./screens/Play";
import { Results } from "./screens/Results";

type Screen = "landing" | "play" | "results";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [playerName, setPlayerName] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const submittedRef = useRef(false);

  const gameInput = useMemo(
    () => (session ? { sessionId: session.sessionId, cards: session.cards } : null),
    [session],
  );
  const game = useGame(gameInput);

  useEffect(() => {
    if (game.status !== "won" || !session || submittedRef.current) {
      return;
    }
    submittedRef.current = true;
    const elapsed = Date.now() - (game.startedAt ?? Date.now());
    setDurationMs(elapsed);

    void (async () => {
      try {
        await completeSession(session.sessionId, {
          moves: game.moves,
          durationMs: elapsed,
        });
      } catch {
        // Still show results even if the score post fails.
      }
      try {
        setLeaderboard(await fetchLeaderboard());
      } catch {
        setLeaderboard([]);
      }
      setScreen("results");
    })();
  }, [game.status, game.moves, game.startedAt, session]);

  async function startGame(name: string) {
    setPending(true);
    setError(null);
    try {
      const next = await createSession(name);
      submittedRef.current = false;
      setPlayerName(next.playerName || name);
      setSession(next);
      setScreen("play");
    } catch {
      setError("Could not start a game. Is the server running?");
      setScreen("landing");
    } finally {
      setPending(false);
    }
  }

  function restartToLanding() {
    setSession(null);
    setScreen("landing");
  }

  if (screen === "play" && session) {
    return (
      <Play
        cards={game.cards}
        moves={game.moves}
        startedAt={game.startedAt}
        locked={game.locked}
        onFlip={game.flip}
        onRestart={restartToLanding}
      />
    );
  }

  if (screen === "results") {
    return (
      <Results
        playerName={playerName}
        moves={game.moves}
        durationMs={durationMs}
        entries={leaderboard}
        pending={pending}
        onPlayAgain={() => {
          void startGame(playerName);
        }}
      />
    );
  }

  return (
    <Landing initialName={playerName} pending={pending} error={error} onStart={(name) => void startGame(name)} />
  );
}
