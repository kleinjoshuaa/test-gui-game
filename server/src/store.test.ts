import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { MAX_OPEN_SESSIONS, Store } from "./store.js";

function tempStore(): { store: Store; dir: string } {
  const dir = mkdtempSync(path.join(tmpdir(), "mosaic-store-"));
  return { store: new Store(dir), dir };
}

describe("Store", () => {
  const dirs: string[] = [];

  afterEach(() => {
    // Temp dirs are left for OS cleanup; track only for clarity.
    dirs.length = 0;
  });

  it("persists scores across reload and drops completed sessions", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "mosaic-store-"));
    dirs.push(dir);
    const first = new Store(dir);
    const session = first.createSession("Ada", "seed-1");
    expect(first.openSessionCount).toBe(1);

    first.completeSession(session.id, 10, 12_000);
    expect(first.openSessionCount).toBe(0);
    expect(first.scoreCount).toBe(1);
    expect(first.getSession(session.id)).toBeUndefined();

    const reloaded = new Store(dir);
    expect(reloaded.openSessionCount).toBe(0);
    expect(reloaded.getLeaderboard()).toEqual([
      {
        id: session.id,
        playerName: "Ada",
        moves: 10,
        durationMs: 12_000,
        completedAt: expect.any(Number),
      },
    ]);
  });

  it("writes atomically via a temp file that does not remain after save", () => {
    const { store, dir } = tempStore();
    dirs.push(dir);
    store.createSession("Bea", "seed-2");

    const raw = readFileSync(path.join(dir, "scores.json"), "utf8");
    expect(JSON.parse(raw).sessions).toHaveLength(1);
    expect(() => readFileSync(path.join(dir, "scores.json.tmp"), "utf8")).toThrow();
  });

  it("strips completed sessions left by older store versions on load", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "mosaic-store-"));
    dirs.push(dir);
    writeFileSync(
      path.join(dir, "scores.json"),
      JSON.stringify(
        {
          sessions: [
            {
              id: "old-open",
              playerName: "Open",
              seed: "s",
              startedAt: 1,
            },
            {
              id: "old-done",
              playerName: "Done",
              seed: "s",
              startedAt: 2,
              completedAt: 3,
              moves: 8,
              durationMs: 9000,
            },
          ],
          scores: [
            {
              id: "old-done",
              playerName: "Done",
              moves: 8,
              durationMs: 9000,
              completedAt: 3,
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );

    const store = new Store(dir);
    expect(store.openSessionCount).toBe(1);
    expect(store.getSession("old-open")).toBeDefined();
    expect(store.getSession("old-done")).toBeUndefined();
    expect(store.scoreCount).toBe(1);
  });

  it("caps open sessions at MAX_OPEN_SESSIONS, dropping oldest", () => {
    const { store } = tempStore();
    const ids: string[] = [];
    for (let i = 0; i < MAX_OPEN_SESSIONS + 5; i++) {
      const session = store.createSession(`P${i}`, `seed-${i}`);
      ids.push(session.id);
    }
    expect(store.openSessionCount).toBe(MAX_OPEN_SESSIONS);
    // First five should have been pruned.
    for (let i = 0; i < 5; i++) {
      expect(store.getSession(ids[i]!)).toBeUndefined();
    }
    expect(store.getSession(ids[5]!)).toBeDefined();
    expect(store.getSession(ids[ids.length - 1]!)).toBeDefined();
  });

  it("rejects completing an unknown or already-scored session", () => {
    const { store } = tempStore();
    expect(() => store.completeSession("missing", 1, 100)).toThrow("Session not found");

    const session = store.createSession("Cara", "seed-3");
    store.completeSession(session.id, 4, 5000);
    expect(() => store.completeSession(session.id, 4, 5000)).toThrow("Session not found");
  });
});
