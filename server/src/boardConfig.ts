export const DEFAULT_BOARD_ROWS = 4;
export const DEFAULT_BOARD_COLS = 4;
export const MIN_BOARD_DIM = 2;
export const MAX_BOARD_DIM = 6;

export type BoardSize = {
  rows: number;
  cols: number;
};

export type BoardSizeResult =
  | { ok: true; size: BoardSize }
  | { ok: false; error: string };

function asInt(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isInteger(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function isOmitted(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

/** Rows × cols must be even, in range, and small enough for `maxPairs` unique symbols. */
export function resolveBoardSize(
  input: { rows?: unknown; cols?: unknown },
  defaults: BoardSize,
  maxPairs: number,
): BoardSizeResult {
  const rows = isOmitted(input.rows) ? defaults.rows : asInt(input.rows);
  const cols = isOmitted(input.cols) ? defaults.cols : asInt(input.cols);

  if (rows === undefined || cols === undefined) {
    return { ok: false, error: "rows and cols must be integers" };
  }
  if (
    rows < MIN_BOARD_DIM ||
    rows > MAX_BOARD_DIM ||
    cols < MIN_BOARD_DIM ||
    cols > MAX_BOARD_DIM
  ) {
    return {
      ok: false,
      error: `rows and cols must be between ${MIN_BOARD_DIM} and ${MAX_BOARD_DIM}`,
    };
  }

  const tiles = rows * cols;
  if (tiles % 2 !== 0) {
    return { ok: false, error: "rows × cols must be even so every tile has a pair" };
  }
  if (tiles / 2 > maxPairs) {
    return { ok: false, error: `board needs at most ${maxPairs} pairs` };
  }

  return { ok: true, size: { rows, cols } };
}

export function boardSizeFromEnv(
  env: NodeJS.ProcessEnv = process.env,
  maxPairs: number,
): BoardSize {
  const defaults: BoardSize = { rows: DEFAULT_BOARD_ROWS, cols: DEFAULT_BOARD_COLS };
  const result = resolveBoardSize(
    { rows: env.BOARD_ROWS, cols: env.BOARD_COLS },
    defaults,
    maxPairs,
  );
  if (!result.ok) {
    throw new Error(`Invalid BOARD_ROWS/BOARD_COLS: ${result.error}`);
  }
  return result.size;
}
