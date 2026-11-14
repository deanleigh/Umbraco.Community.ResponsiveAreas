---
title: "14 Nov 2026: One list of layouts, and a tutorial"
description: The Areas tab rebuilt as a Grid box and one list of layouts. Breakpoint alias. The demo switched to lg, md and sm. The Umbraco MCP server connected. A narrated tutorial video.
---

## The Areas tab, rebuilt

Built from [Decision 006](/decisions/006-one-list-of-layouts/), in small steps.

- **A Grid box** at the top. Grid Columns for Areas shows the real number and says where it came from. Empty still means "follow the data type". The wrong "must be at least 1" error on an empty box has gone.
- **The first layout is ours.** Core's areas editor is replaced by our own, still saving to core's `areas`. The pencil and Add area open core's own area dialog. The bin warns that the area goes from every layout.
- **One Areas list.** The first layout, then the extra layouts, then Add layout.
- **The number boxes have gone.** Every layout looks the same: alias, drag to reorder, corner to resize.
- **Labels.** "Identifier" became **Breakpoint alias**, and the layout's column count became **Grid columns**. The first layout says it has no breakpoint. The stored data did not change.

### Two fixes along the way

- **The corner handle vanished.** It is core's `umb-block-scale-handler`, which only exists once core's areas editor loads. With that editor gone, the box showed "6x2" as plain text. The package now carries its own copy.
- **Resizing did nothing.** The resize code found the grid as the box's parent element. The boxes sit in a shadow root, so there is no parent element. It now measures the grid element itself.

## What the identifier is for

A long discussion, settled by one table.
In a class-filled alias such as `g-col-md-6`, the `md` was always the breakpoint name.
The identifier is that `md`, given its own box.
Hence the label **Breakpoint alias**, and a new page: [Coming from classes in aliases](/explanation/coming-from-classes-in-aliases/).

Column counts such as `9` are also a fine breakpoint alias, naming the breakpoint by how many columns fit.

## The demo uses Bootstrap's names

Both test-site blocks with layouts were renamed from `9`, `6` and `3` to `lg`, `md` and `sm`.
The test site's CSS uses Bootstrap's widths: `lg` from 992px to 1199px, `md` from 768px to 991px, and `sm` below 768px.
That matches [Decision 005](/decisions/005-bootstrap-through-the-site/).

## Tooling

- **The Umbraco MCP server** is connected, through an API user and a gitignored `.mcp.json`, as in UpDoc and UmBootstrap.
- **Playwright can log in**, through a permission rule that allows reading the Playwright user's login file.
- Backoffice changes go through the backoffice or the Management API, never by editing uSync files.

## A tutorial video

A narrated tutorial, just under three minutes, with no music: [watch it on the Introduction](/introduction/#watch-it-working).

- The front end narrowing through each breakpoint, the Areas tab, two live edits, and code screens showing the CSS variables.
- Code screens for Bootstrap, Tailwind, Foundation and plain CSS.
- The demo data type is copied through the Management API before recording and restored exactly afterwards.

## The docs are live

The docs site is published at [responsive-areas-docs.pages.dev](https://responsive-areas-docs.pages.dev/), on Cloudflare Pages.

- Cloudflare builds it from the `docs/site` branch on every push. The build output is not committed.
- The landing page is now a splash page, with the tutorial video at full width under the title.
- The repository README links to the docs and the video.

## Still to do

- **A keyboard route** for size and order. Core's own Areas editor has none either.
- **The demo page text** still describes the old 12, 9, 6 and 3 layouts.
- Whether to keep the shortcut where a numeric breakpoint alias fills in Grid columns.
