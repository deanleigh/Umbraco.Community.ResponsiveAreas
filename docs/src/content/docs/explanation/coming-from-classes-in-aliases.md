---
title: Coming from classes in aliases
description: If you put framework classes into area aliases today, this shows where each part of that alias goes with ResponsiveAreas.
---

Many sites make Block Grid areas responsive by typing framework classes into the area alias.
That alias ends up doing several jobs at once.

ResponsiveAreas gives each job its own place.

## One alias, split up

A typical alias on a Bootstrap site:

```
primary g-col-12 g-col-md-6 g-col-lg-8 order-md-2 rounded-4
```

| Part of the old alias | What it was | Where it goes now |
|---|---|---|
| `primary` | the area's name | **stays as the alias** |
| `g-col-12` | the span with no breakpoint | **the first layout**: core's own span, set by dragging the corner |
| `md`, `lg` | breakpoint names | **each layout's breakpoint alias** |
| `6`, `8` | the span at each breakpoint | **each layout**: drag the area's corner |
| `order-md-2` | the order at a breakpoint | **each layout**: drag the area to a new position |
| `rounded-4` | styling | **your CSS**, targeting the alias, or the block's **Settings** |

The breakpoint name was there all along, as the `md` in `g-col-md-6`.
Now it has its own box.

## What you gain

- **You can see every layout.** Before, the backoffice showed only the base span. The `md` and `lg` arrangements were text in the alias.
- **No typos.** A span is set by dragging, so `g-col-md-66` cannot happen.
- **The alias stays stable.** Views and CSS that use it, such as `GetBlockGridItemAreaHtmlAsync(Model, "primary")` or `[data-area-alias="primary"]`, keep working when the layout changes.
- **No framework lock-in.** The same layouts work with Bootstrap, Tailwind, Foundation or your own CSS.

## What changes for the site

The front end can stay exactly the same.

- **Write a little CSS.** ResponsiveAreas outputs CSS variables, so the site needs one rule per breakpoint, written once. See the [front-end output reference](/reference/front-end-output/).
- **Or keep the classes.** A site's area view can build the same Bootstrap classes from the layout data. A layout with the breakpoint alias `md` and a span of 6 becomes `g-col-md-6` ([Decision 005](/decisions/005-bootstrap-through-the-site/)).

Only where you enter the numbers changes: by dragging in the backoffice, instead of typing into the alias.

## Styling

Utility classes such as `rounded-4` or `border` are a common way to style areas.
In the alias, they make changing the look change the name.

Ways to keep them, without the alias:

- **In the area view, mapped from the alias.** For example, `media` gets `rounded-4 border`.
- **In Sass, with `@extend`.** `[data-area-alias="media"] { @extend .rounded-4, .border; }`
- **In the block's Settings**, when editors should choose, such as a "Rounded corners" toggle.

## Naming breakpoints

The breakpoint alias is any name your CSS uses for that breakpoint.

| Style | Example | Notes |
|---|---|---|
| Framework names | `md`, `lg`, or Foundation's `medium` | Familiar to anyone who knows the framework. |
| Widths | `768` | Says exactly when it applies. |
| Column counts | `9` | Names the breakpoint by how many columns fit. Keep the layout's grid columns in step if you change it. |

The layout's **grid columns** is a separate number: how many columns its grid has.
It often matches a column-count name, but it doesn't have to.
