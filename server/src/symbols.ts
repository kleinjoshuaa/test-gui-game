export type SymbolDef = {
  id: string;
  glyph: string;
  label: string;
  color: string;
};

/** Unique pair glyphs. Enough for a 6×6 board (18 pairs). Colors are client display hints. */
export const SYMBOLS: readonly SymbolDef[] = [
  { id: "spark", glyph: "✦", label: "Spark", color: "#2dd4bf" },
  { id: "kite", glyph: "◆", label: "Kite", color: "#ff6b6b" },
  { id: "dot", glyph: "●", label: "Dot", color: "#fbbf24" },
  { id: "peak", glyph: "▲", label: "Peak", color: "#22d3ee" },
  { id: "tile", glyph: "■", label: "Tile", color: "#fb7185" },
  { id: "star", glyph: "★", label: "Star", color: "#f59e0b" },
  { id: "gem", glyph: "♦", label: "Gem", color: "#34d399" },
  { id: "glint", glyph: "✧", label: "Glint", color: "#38bdf8" },
  { id: "moon", glyph: "☽", label: "Moon", color: "#a78bfa" },
  { id: "bolt", glyph: "⚡", label: "Bolt", color: "#facc15" },
  { id: "heart", glyph: "♥", label: "Heart", color: "#f472b6" },
  { id: "ring", glyph: "◎", label: "Ring", color: "#67e8f9" },
  { id: "drop", glyph: "▼", label: "Drop", color: "#fb923c" },
  { id: "plus", glyph: "✚", label: "Plus", color: "#4ade80" },
  { id: "hex", glyph: "⬡", label: "Hex", color: "#c084fc" },
  { id: "bloom", glyph: "✿", label: "Bloom", color: "#fb7185" },
  { id: "orbit", glyph: "◉", label: "Orbit", color: "#2dd4bf" },
  { id: "shard", glyph: "◇", label: "Shard", color: "#93c5fd" },
];
