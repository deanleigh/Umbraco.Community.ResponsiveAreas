---
title: Front-end output
description: How a site renders responsive areas. The service, the two style helpers, the CSS variable names and example CSS.
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

Writes each layout's column count.

```razor
<div class="areas" style="@responsive.BlockStyle()">
```

Output:

```css
--umb-block-grid--area-grid-columns--9: 9;
--umb-block-grid--area-grid-columns--6: 6;
```

### On each area: `AreaStyle(alias)`

Writes the area's column span, row span and order in each layout.

```razor
@{
    var responsive = ViewData["ResponsiveAreas"] as ResponsiveBlockLayouts;
}
<div style="--umb-block-grid--area-column-span: @Model.ColumnSpan; --umb-block-grid--area-row-span: @Model.RowSpan; @responsive?.AreaStyle(Model.Alias)">
```

Output:

```css
--umb-block-grid--area-column-span--9: 6;
--umb-block-grid--area-row-span--9: 1;
--umb-block-grid--area-order--9: 2;
```

Values are already resolved.
If an area has no value for a layout, it inherits the base layout.

## Variable names

Names follow core's own Block Grid variables, with the layout identifier on the end ([Decision 004](/decisions/004-framework-free-output/)).

| Variable | Set on | Meaning |
|---|---|---|
| `--umb-block-grid--area-grid-columns--{id}` | Areas wrapper | Columns in layout `{id}` |
| `--umb-block-grid--area-column-span--{id}` | Area | Column span in layout `{id}` |
| `--umb-block-grid--area-row-span--{id}` | Area | Row span in layout `{id}` |
| `--umb-block-grid--area-order--{id}` | Area | Order in layout `{id}` |

The base layout uses core's names with no identifier: `--umb-block-grid--area-column-span` and `--umb-block-grid--area-row-span`.

## Example CSS

One media query per layout.
The identifiers are the site's choice. This example uses `9`, `6` and `3`.

```css
@media (576px <= width < 992px) {
  .areas {
    grid-template-columns: repeat(var(--umb-block-grid--area-grid-columns--6, 12), 1fr);
  }
  .areas > .area {
    grid-column: auto / span var(--umb-block-grid--area-column-span--6, var(--umb-block-grid--area-column-span));
    grid-row: auto / span var(--umb-block-grid--area-row-span--6, var(--umb-block-grid--area-row-span, 1));
    order: var(--umb-block-grid--area-order--6, 0);
  }
}
```

Each variable falls back to the base layout.
A block without that layout keeps its base spans.

### With Bootstrap's CSS grid

Bootstrap's `.grid` reads `--bs-columns`.
Set it from the layout instead of setting `grid-template-columns`:

```css
.areas { --bs-columns: var(--umb-block-grid--area-grid-columns--6, 12); }
```

The test site's `wwwroot/css/responsive-areas.css` is a complete example.

## Known limits

- **Matching is by block type and area alias.** Rendered areas carry no key, and a rendered block does not know its data type. If one element type is set up differently in two Block Grid data types, the first one with layouts wins. If core added the key to `BlockGridArea`, this would be exact.
- **The cache clears on the server where the data type was saved.** On a load-balanced site, other servers keep the old layouts until they restart.
