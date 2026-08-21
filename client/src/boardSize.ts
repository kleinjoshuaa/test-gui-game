export const DEFAULT_BOARD_ROWS = 4;
export const DEFAULT_BOARD_COLS = 4;
export const MIN_BOARD_DIM = 2;
export const MAX_BOARD_DIM = 6;

export type BoardSize = {
  rows: number;
  cols: number;
};

export function isValidBoardSize(rows: number, cols: number): boolean {
  if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
    return false;
  }
  if (rows < MIN_BOARD_DIM || rows > MAX_BOARD_DIM) {
    return false;
  }
  if (cols < MIN_BOARD_DIM || cols > MAX_BOARD_DIM) {
    return false;
  }
  return (rows * cols) % 2 === 0;
}
