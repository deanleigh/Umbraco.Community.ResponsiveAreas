---
title: "005: Bootstrap through the site, not the package"
description: Bootstrap sites name layouts after Bootstrap breakpoints and build g-col classes from the numbers in their own partial.
---

**Date:** 13 Nov 2026
**Status:** Accepted

## Context

UmBootstrap, and sites built on it, use Bootstrap's CSS grid mode.

- The areas wrapper uses Bootstrap's `.grid`, which reads `--bs-columns`.
- Spans are **classes**, such as `g-col-md-8`. Bootstrap has no span variable.

Today those classes are typed into each area's alias.

## Decision

Bootstrap connects in the **site**, not the package.

1. Name layouts after Bootstrap breakpoints: `md`, `lg` and so on.
2. The site's `area.cshtml` builds the classes from the stored numbers. The `md` layout with a span of 8 becomes `g-col-md-8`.

Aliases go back to being names: `tertiary`, `primary`, `secondary`.

## Consequences

- **The same output as today, from data editors can see.**
- **Fixed 12-column layouts are pure Bootstrap.** No extra CSS.
- **Changing the column count per breakpoint needs a little CSS.** Bootstrap cannot change `--bs-columns` per breakpoint on its own.
- **This is a proof of concept.** The Bootstrap partial is an example for UmBootstrap, not part of the package.
