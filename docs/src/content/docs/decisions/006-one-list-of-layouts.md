---
title: "006: One list of layouts, the first one core's"
description: The Areas tab becomes a Grid box and one list of layouts. The first layout is core's own areas, with no breakpoint. Core's data is unchanged.
---

**Date:** 14 Nov 2026
**Status:** Accepted. Built the same day.

## Context

The Areas tab had three parts:

1. **Grid Columns for Areas**, core's column count.
2. **Areas**, core's editor, where areas are added and edited.
3. **Layouts**, our section, listing the extra layouts.

The base areas are a layout too.
But they looked different from the layouts below them, and the Layouts section did not read as a continuation of the areas above it.

Anyone using the tab must be able to keep what they have.

## Decision

### A Grid box at the top

- **Grid Columns for Areas** shows the real number, filled in from the Block Grid data type.
- A line underneath says where it comes from: "Following the data type (12)", or "Set for this block. The data type uses 12", with a button to go back.
- Empty, or the data type's own number, means "follow the data type". Nothing is stored, exactly as in core.

### One Areas list

1. **The first layout** is core's areas.
   - Its header says **Breakpoint alias: None. Used on every screen unless a layout below applies.**
   - Areas are added here, with **Add area**.
   - Each box has core's pencil and bin. The pencil opens core's own area dialog.
   - The bin warns that the area is removed from every layout.
2. **Each extra layout** has a **Breakpoint alias**, **Grid columns** and a bin.
3. **Add layout** sits at the bottom.

Every layout looks the same: boxes showing the alias, drag to reorder, and core's corner handle to resize.
The number boxes for columns, rows and order were removed.
A keyboard route for size and order is still to come.

### Breakpoint alias

The layout's identifier is labelled **Breakpoint alias**.
It is the name the site's CSS uses for that breakpoint: `md`, `768`, or a column count such as `9`.
The stored property is still `identifier`, so nothing changed underneath.

Every CSS framework calls this a breakpoint: Bootstrap's `md` in `g-col-md-6`, Tailwind's `md:`, Foundation's `medium`.
The first layout is the equivalent of a class with no breakpoint, such as Bootstrap's `col-6`.

### Core's data does not change

- The first layout writes core's `areaGridColumns` and `areas`, with core's own spans and order.
- Extra layouts stay in our own properties ([Decision 001](/decisions/001-store-layouts-inline/)).
- Remove the package and every block still works as core expects. Only the extra layouts are lost.

## How it is built

- **The first layout is a property editor** inside `<umb-property alias="areas">`. Core's area dialog finds the areas through that property, so it has to sit there, as core's own editor does.
- **The extra layouts live in the same editor**, so the whole list is one property row.
- **Core's area dialog** is opened with our own copy of its modal token. Core does not export it, but it is the standard workspace dialog for the `block-grid-area-type` entity.
- **The corner handle is a copy of core's** `umb-block-scale-handler`. Core only defines its handle when core's Areas editor loads, and the tab no longer shows that editor.

## Consequences

- **One pattern to learn.** The first layout and the extra layouts look and work alike.
- **No breaking changes.** Existing blocks open as they are: a first layout with no extra layouts.
- **Order is visual only.** The HTML follows the first layout's order, so that is the reading order. The tab's help text says so.
- **More code of our own.** We render the areas ourselves instead of embedding core's editor.

The earlier [clickable mockup](/mockups/one-list-of-layouts-mockup.html) shows the idea before it was built.
