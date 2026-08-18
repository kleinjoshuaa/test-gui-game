# Memory Mosaic

A browser matching game built for Cursor Design Mode demos: DOM flip-cards, CSS tokens, and a thin Express API for sessions and scores.

## Stack

- **client** — Vite + React + TypeScript (port 5173)
- **server** — Express + TypeScript (port 3001)
- **pnpm** workspaces

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to the backend.

## Gameplay

1. Enter a display name and start.
2. Flip two cards per turn; matches stay up.
3. Clear the 4×4 board; your time and moves land on the leaderboard.

## Design Mode

Restyle `--accent`, card faces, radii, and display typography in `client/src/styles/tokens.css` (or via Design Mode on the Play / Results screens). Gameplay stays wired to CSS variables so chrome changes without breaking the match flow.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run API + client together |
| `pnpm test` | Vitest in both packages |
| `pnpm typecheck` | Typecheck both packages |
| `pnpm build` | Production build |

## API

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/sessions` | Create seeded board |
| `POST` | `/api/sessions/:id/complete` | Submit score |
| `GET` | `/api/leaderboard` | Top 10 |
| `GET` | `/api/health` | Health check |
