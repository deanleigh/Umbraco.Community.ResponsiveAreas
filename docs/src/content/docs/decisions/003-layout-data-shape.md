---
title: "003: Layout data shape"
description: Layouts are listed on the block type with a stable key. Each area stores column span, row span and order per layout, keyed by that key.
---

**Date:** 13 Nov 2026
**Status:** Accepted

## Context

[Decision 001](/decisions/001-store-layouts-inline/) stores layout data inline.
This decision settles its shape.

Things to cover:

- Each layout has an identifier, such as `md` or `9`, and a column count.
- Each area needs its own values in each layout.
- Core's areas already store a column span **and** a row span. CSS grid uses both.
- Identifiers will get renamed.

## Decision

**On the block type**, a list of layouts:

```json
"responsiveLayouts": [
  { "key": "3f6c…", "identifier": "md", "columns": 12 }
]
```

**On each area**, its values per layout, keyed by the layout's **key**:

```json
"responsiveLayouts": {
  "3f6c…": { "columnSpan": 8, "rowSpan": 1, "order": 2 }
}
```

The base layout is core's own data: `areaGridColumns`, and each area's `columnSpan` and `rowSpan`.

## Consequences

- **Row span is set per layout**, like column span.
- **Renaming an identifier changes one value.** Areas refer to the key, not the identifier. This is the same reason core gives each area a key as well as an alias.
- **Core's data is untouched.** Without the package, a block falls back to its base layout.
- **Values are only stored once changed.** Until then, an area inherits the base layout in that layout: its column span (capped to fit), its row span and its position. A new layout starts as a copy of the base layout, and the stored data stays small.
