---
title: Front-end output
description: How a site renders responsive areas. The service, the two style helpers, the CSS variable names and example CSS for Bootstrap, Tailwind, Foundation and plain CSS.
---

ResponsiveAreas does not change your markup.
It gives your views **numbers**, as CSS variables.
Your CSS decides when each layout applies.

## The service

Inject `IResponsiveAreasService` into the view that renders a block's areas.
Usually that is `Views/Partials/blockgrid/areas.cshtml`.

```razor
@using Umbraco.Community.ResponsiveAreas.Rendering
@inject IResponsiveAreasService ResponsiveAreas
@{
    var responsive = await ResponsiveAreas.GetBlockLayoutsAsync(Model);
    ViewData["ResponsiveAreas"] = responsive;
}
```

`GetBlockLayoutsAsync` takes the `BlockGridItem` and returns a `ResponsiveBlockLayouts`.
A block with no layouts returns an empty result, so the call is always safe.

## The two helpers

### On the areas wrapper: `BlockStyle()`

Writes each layout's grid columns.

```razor
<div class="areas" style="@responsive.BlockStyle()">
```

Output, for layouts with the breakpoint aliases `lg`, `md` and `sm`:

```css
--umb-block-grid--area-grid-columns--lg: 9;
--umb-block-grid--area-grid-columns--md: 6;
--umb-block-grid--area-grid-columns--sm: 3;
```

### On each area: `AreaStyle(alias)`

Writes the area's column span, row span and order in each layout.

```razor
@{
    var responsive = ViewData["ResponsiveAreas"] as ResponsiveBlockLayouts;
}
<div style="--umb-block-grid--area-column-span: @Model.ColumnSpan; --umb-block-grid--area-row-span: @Model.RowSpan; @responsive?.AreaStyle(Model.Alias)">
```

Output, for one layout:

```css
--umb-block-grid--area-column-span--md: 3;
--umb-block-grid--area-row-span--md: 1;
--umb-block-grid--area-order--md: 3;
```

Values are already resolved.
If an area has no value for a layout, it inherits the first layout's.

## Variable names

Names follow core's own Block Grid variables, with the layout's **breakpoint alias** on the end ([Decision 004](/decisions/004-framework-free-output/)).

| Variable | Set on | Meaning |
|---|---|---|
| `--umb-block-grid--area-grid-columns--{alias}` | Areas wrapper | Grid columns in that layout |
| `--umb-block-grid--area-column-span--{alias}` | Area | Column span in that layout |
| `--umb-block-grid--area-row-span--{alias}` | Area | Row span in that layout |
| `--umb-block-grid--area-order--{alias}` | Area | Order in that layout |

The first layout has no breakpoint alias. It uses core's own names: `--umb-block-grid--area-column-span` and `--umb-block-grid--area-row-span`.

The breakpoint alias is the site's choice.
Use your framework's breakpoint names (`md`, `medium`), widths (`768`), or column counts (`9`).
Only letters, numbers, `-` and `_` are kept, so the alias is always safe in a CSS name.

## Example CSS

One rule per layout.
Each variable falls back to the first layout, so a block without that layout keeps its first layout.

### Plain CSS

```css
@media (768px <= width < 992px) {
  .areas {
    grid-template-columns: repeat(var(--umb-block-grid--area-grid-columns--md, 12), 1fr);
  }
  .areas > .area {
    grid-column: auto / span var(--umb-block-grid--area-column-span--md, var(--umb-block-grid--area-column-span));
    grid-row: auto / span var(--umb-block-grid--area-row-span--md, var(--umb-block-grid--area-row-span, 1));
    order: var(--umb-block-grid--area-order--md, 0);
  }
}
```

Use `@container` instead of `@media` if the block can be resized, so the layout follows the block's width rather than the screen's.

### Bootstrap

Bootstrap's `.grid` reads `--bs-columns`.
Set it from the layout instead of setting `grid-template-columns`, and use Bootstrap's own widths:

```css
@media (768px <= width < 992px) {
  .areas { --bs-columns: var(--umb-block-grid--area-grid-columns--md, 12); }
}
```

The test site's `wwwroot/css/responsive-areas.css` is a complete example, with `lg`, `md` and `sm`.

### Tailwind

```css
.area {
  @variant md {
    grid-column: span var(--umb-block-grid--area-column-span--md);
  }
}
```

### Foundation

Name the breakpoint alias after Foundation's breakpoints, such as `medium`:

```scss
.area {
  @include breakpoint(medium) {
    grid-column: span var(--umb-block-grid--area-column-span--medium);
  }
}
```

## Known limits

- **Matching is by block type and area alias.** Rendered areas carry no key, and a rendered block does not know its data type. If one element type is set up differently in two Block Grid data types, the first one with layouts wins. If core added the key to `BlockGridArea`, this would be exact.
- **The cache clears on the server where the data type was saved.** On a load-balanced site, other servers keep the old layouts until they restart.
