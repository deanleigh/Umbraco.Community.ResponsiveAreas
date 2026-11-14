---
title: "14 Nov 2026: Core's drag and a demo video"
description: The layout grids now move and resize like core's Areas editor. A narrated demo video. A question from HQ about resizable blocks.
---

## Layout grids behave like core

The area boxes in each layout now work like the Areas boxes above them.

- **Move:** hover anywhere on a box for the move cursor, then drag it. This uses core's `UmbSorterController` with grid placement, the same code as core's Areas editor. The grip icon has gone.
- **Resize:** the corner is core's `umb-block-scale-handler`, with its live "3x1" label.
- **Numbers:** the Columns, Rows and Order boxes stay. They are the keyboard and screen reader route, and the precise one.

Each layout's grid is now its own element, `responsive-areas-layout-grid`.
Core's sorter expects one container per element, and there is one grid per layout.
Every change still goes through the same single write path.

## Demo video

A narrated walkthrough, about two and a half minutes, for the Builder Day demo.
It moves between the backoffice and the front end, reordering and resizing areas.

- Narration from edge-tts, recording driven by Playwright, rendered with Remotion.
- The scripts and the final MP4 are in the repository's `video` folder.

## A question from HQ: resizable blocks

HQ asked how ResponsiveAreas behaves when editors can resize blocks.

- In the content editor only blocks resize, never areas. A block type gets a resize handle when its size options allow more than one column span.
- If a block is resized to half width, media queries still see the wide screen. The site's CSS should switch layouts with container queries on the block instead.
- That is site CSS, so the package does not change.

A demo is planned in [issue #1](https://github.com/deanleigh/Umbraco.Community.ResponsiveAreas/issues/1).

## Looking ahead to Umbraco 19

Compared core's Areas editor in 17.8.0 and 19.0.0-rc1.

- **Small visual polish only:** white area boxes, 1px gaps and a neater corner handle. No redesign.
- **Tab weight changed** from 1000 to 900. Our replacement tab copies core's weight, so it needs updating when the package supports 19.
