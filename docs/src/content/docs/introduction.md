---
title: Introduction
description: What ResponsiveAreas is, the problem it solves, and what we are building.
---

ResponsiveAreas gives Block Grid areas more than one layout.

This page shows how areas work today, where that falls short, and what we are building instead.

## How Block Grid areas work today

A Block Grid block can contain **areas**.
Areas are the slots editors put content into.

You set them up on the block type's **Areas** tab:

- **Grid Columns for Areas** sets how many columns the block has.
- Each area is a grey box with an alias.
- You drag a box's corner to set how many columns it spans.

![The core Areas tab for the "Layout - 3 | 6 | 3" block type. Three grey area boxes span 3, 6 and 3 columns. Each alias is long and full of Bootstrap classes, and the text runs into the edit and delete icons.](../../assets/screenshots/introduction/01-core-areas-tab.png)

This block has three areas: tertiary, primary and secondary.
They span 3, 6 and 3 of 12 columns.

On the front end, that gives a three-column layout.

![The front end at desktop width. The page shows three columns: a Layouts menu on the left, the main content in the middle and an aside on the right.](../../assets/screenshots/introduction/03-front-end-3-6-3.png)

## The problem

Each block has **one** layout.

3 | 6 | 3 works on a wide screen.
On a tablet or a phone, three columns are too narrow.
The areas need to change their spans, and sometimes their order.

Core has no way to say that.

### The workaround

The common workaround puts CSS framework classes into the area's **alias**.

![The area settings modal for the primary area. The Alias field contains "primary g-col-12 g-col-md-8 g-col-lg-6 p-3 rounded-4".](../../assets/screenshots/introduction/02-core-area-settings.png)

The site's views print the alias as a class.
Bootstrap does the rest.

It works.
At tablet width, this block becomes 4 | 8, and the aside drops below.

![The same page at tablet width. The Layouts menu and main content sit side by side, and the aside has moved below them.](../../assets/screenshots/introduction/03b-front-end-tablet.png)

But it has costs:

- **The alias becomes styling.** An alias should identify an area. Here it carries spans, padding and corner radius.
- **It is tied to one framework.** Change from Bootstrap and every alias breaks.
- **Editors cannot see it.** The Areas tab shows one layout. The tablet and phone layouts exist only as class names.
- **It is easy to break.** One typo in an alias changes the layout silently.

## What we are building

ResponsiveAreas replaces the block type's **Areas** tab.

The new tab keeps everything editors know from core, and adds **layouts**.

![A mockup of the ResponsiveAreas tab for "Layout - 3 | 6 | 3". A base layout of 12 columns sits at the top. Below it are layouts for 9, 6 and 3 columns. Each is drawn narrower than the last, and the same three areas are resized and reordered in each.](../../assets/screenshots/introduction/04-responsive-areas-mockup.png)

:::note
This is a mockup, not the finished tab.
The real tab is built from core's own Areas tab, so it looks and behaves like Umbraco.
You can [try the interactive mockup](/mockups/responsive-areas-tab-mockup.html).
:::

- **The base layout** is the one you know. Areas are added and deleted here.
- **Each extra layout** has an identifier and a column count.
- **In each layout, the same areas** can be resized and reordered.
- **Each layout is drawn to scale**, so a 6-column layout is half the width of a 12-column one.

Aliases go back to being names.

## See it working

The test site has a demo page: one block, four areas, four layouts.
The aliases are plain `a`, `b`, `c` and `d`. Every move comes from the layouts.

At 12 columns, area a is a tall feature spanning two rows.

![The demo block at 12 columns. Blue area a spans two rows on the left. Green area b sits top right. Yellow area c and red area d sit side by side below b. A badge reads "Layout: 12 (base)".](../../assets/screenshots/introduction/05-demo-12.png)

At 9 columns, area a runs across the top.

![The demo block at 9 columns. Area a runs full width across the top. Areas b, c and d sit in a row of three below it. A badge reads "Layout: 9".](../../assets/screenshots/introduction/05-demo-9.png)

At 6 columns, area d leads the page.

![The demo block at 6 columns. Red area d is first and full width. Area a follows, full width. Areas b and c sit side by side at the bottom. A badge reads "Layout: 6".](../../assets/screenshots/introduction/05-demo-6.png)

At 3 columns, everything stacks in a new order: c, a, d, b.

![The demo block at 3 columns. The areas are stacked one above the other, in the order c, a, d, b. A badge reads "Layout: 3".](../../assets/screenshots/introduction/05-demo-3.png)

## How the front end uses it

ResponsiveAreas does not decide when a layout applies.
**Your site's CSS does.**

The package writes each area's span and order as CSS variables, one set per layout.
Your stylesheet decides which set to use at which screen size.

That means:

- **No CSS framework required.** Bootstrap, your own grid, or nothing at all.
- **No breakpoints in the backoffice.** Editors and developers each work where they should.
- **Any grid model works.** Keep 12 columns and change spans, or change the column count itself (12, 9, 6, 3).

## What we are aiming for

- **Responsive areas that editors can see.**
- **Aliases that are just aliases.**
- **No dependency on any CSS framework.**
- **A tab that feels like part of Umbraco.**

ResponsiveAreas starts as a package.
The long-term aim is to propose it to Umbraco core.
