---
title: "006: One list of layouts, the default first"
description: The base areas are the first layout. Every layout shares one look, and core's data is unchanged.
---

**Date:** 14 Nov 2026
**Status:** Proposed. Try the [clickable mockup](/mockups/one-list-of-layouts-mockup.html) first.

## Context

The Areas tab has three parts today:

1. **Grid Columns for Areas**, core's column count.
2. **Areas**, core's editor, where areas are added and edited.
3. **Layouts**, our section, listing the extra layouts.

The base areas are a layout too. But they look different from the layouts below them.
The Layouts section does not read as a continuation of the Areas above it.

The package also has to be good enough to use for a year on its own.
Core may or may not adopt it. Any site using it must be able to keep what it has.

## Decision

Show **one list of layouts**. The default layout comes first.

- **Every layout has the same header:** Identifier and Columns.
- **The default layout's Columns is core's Grid Columns for Areas.** Same setting, better place.
- **Areas are added only in the default layout.** Every layout has the same areas. Sites that want different areas per layout can custom code it.
- **The default layout cannot be removed.** Extra layouts have a bin.
- **Add area** sits inside the default layout. **Add layout** sits below the last layout.

### Core's data does not change

- The default layout still writes core's `areaGridColumns` and `areas`, with core's own spans.
- Extra layouts stay in our own properties ([Decision 001](/decisions/001-store-layouts-inline/)).
- Uninstall the package and every block still works as core expects. Only the extra layouts are lost.

## Consequences

- **One pattern to learn.** The default layout and the extra layouts look and work alike.
- **We render core's Areas editor ourselves**, rather than embedding it unchanged. More code, but the look is ours to keep consistent.
- **No breaking changes.** Existing blocks open as they are: a default layout with no extra layouts.

## Open question

The default layout's **Identifier**. Core has nowhere to store it.

- Show it read-only, as its column count, for example "12".
- Or store it in our own property, which core ignores.

To be decided from the mockup.
