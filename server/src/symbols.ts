export type SymbolDef = {
  id: string;
  glyph: string;
  label: string;
  color: string;
};

/** Eight visually distinct glyphs. Colors are client display hints (teal/coral on slate). */
export const SYMBOLS: readonly SymbolDef[] = [
  { id: "spark", glyph: "✦", label: "Spark", color: "#2dd4bf" },
  { id: "kite", glyph: "◆", label: "Kite", color: "#ff6b6b" },
  { id: "dot", glyph: "●", label: "Dot", color: "#fbbf24" },
  { id: "peak", glyph: "▲", label: "Peak", color: "#22d3ee" },
  { id: "tile", glyph: "■", label: "Tile", color: "#fb7185" },
  { id: "star", glyph: "★", label: "Star", color: "#f59e0b" },
  { id: "gem", glyph: "♦", label: "Gem", color: "#34d399" },
  { id: "glint", glyph: "✧", label: "Glint", color: "#38bdf8" },
];
