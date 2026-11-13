---
title: "002: Numbers alongside dragging"
description: Each area shows Columns, Rows and Order boxes. Dragging fills them in; typing resizes the area.
---

**Date:** 13 Nov 2026
**Status:** Accepted

## Context

Core lets you resize an area by dragging its corner.
The layouts UI adds reordering by dragging.

Dragging alone is not enough:

- Some people cannot use a mouse or a touch screen.
- Dragging is imprecise when a layout has many columns.
- What gets stored is numbers anyway.

## Decision

Each area, in each layout, shows three number boxes: **Columns**, **Rows** and **Order**.

- Dragging an area's corner fills in Columns and Rows.
- Dragging an area to a new position fills in Order.
- Typing into a box resizes or moves the area.

Both routes produce the same stored numbers.

## Consequences

- **Keyboard and screen reader users can set every layout.** The boxes are the accessible route, not an extra.
- **Exact values are easy.** No need to drag carefully to hit a span.
- **The UI needs room for the boxes.** Each area box gets slightly busier than core's.
