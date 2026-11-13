---
title: "001: Store layouts inline"
description: Layout data is stored on the area objects and block type, inside the Block Grid data type configuration.
---

**Date:** 13 Nov 2026
**Status:** Accepted

## Context

Each layout needs to store a span and an order for every area, plus an identifier and column count for the layout itself.

There were two options:

- **Inline.** Add our own properties to the area objects and the block type, inside the Block Grid data type's configuration.
- **Sidecar.** Store layouts somewhere else, keyed by data type, block and area.

Inline only works if Umbraco keeps properties it does not know about.

## What we checked

We read the 17.8.0 source first.

- **Server.** The data type configuration is saved as plain JSON. The C# model is only used when reading it, not when saving.
- **Browser.** Resizing an area merges the new span into the existing object. The area settings modal loads the whole area and writes the whole area back.

Then we tested it.
A temporary button wrote `responsiveAreasTest: "hello"` onto one area and onto the block type.

1. Saved the data type. Both values were in the uSync export.
2. Resized that area and changed its label in the settings modal. Saved again.
3. Both values were still there, next to the new span and label.

## Decision

Store layout data inline.

- Per-area layout values go on each area object.
- Layout definitions (identifier, column count) go on the block type.

## Consequences

- **No extra storage.** Layouts live in the data type, so uSync, deploys and backups carry them for free.
- **Removing the package leaves the data behind.** Core ignores the extra properties. Blocks fall back to their base layout.
- **Rendering must read the raw configuration.** Umbraco's C# model for Block Grid configuration does not know our properties and drops them when it reads. The output partial cannot rely on it.
- **Core could change.** A future Umbraco version could start stripping unknown properties. The test above is quick to repeat after each upgrade.
