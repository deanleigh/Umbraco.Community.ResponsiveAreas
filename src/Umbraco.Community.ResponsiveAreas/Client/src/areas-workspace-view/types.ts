// Stored on the block type as `responsiveLayouts`. See Decision 003 in the docs.
export interface ResponsiveLayout {
  key: string;
  identifier: string;
  columns: number;
}

// Stored on each area as `responsiveLayouts`, keyed by the layout's key. See Decision 003.
export interface ResponsiveAreaLayoutValues {
  columnSpan: number;
  rowSpan: number;
  order: number;
}

// Core's area object, plus our per-layout values. Other core properties are kept as they are.
export interface ResponsiveArea {
  key: string;
  alias?: string;
  columnSpan?: number;
  rowSpan?: number;
  responsiveLayouts?: Record<string, ResponsiveAreaLayoutValues>;
  [other: string]: unknown;
}
