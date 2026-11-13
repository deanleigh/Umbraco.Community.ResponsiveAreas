---
title: "004: Framework-free output"
description: The package exposes layout numbers to views and as CSS variables named after core's. It never writes framework classes.
---

**Date:** 13 Nov 2026
**Status:** Accepted

## Context

The package must work with any CSS: Bootstrap, a custom grid, or none.
It is also a candidate for Umbraco core, which cannot depend on a framework.

Core's Block Grid views already write CSS variables:

| Where | Variable |
|---|---|
| Areas wrapper | `--umb-block-grid--area-grid-columns` |
| Each area | `--umb-block-grid--area-column-span`, `--umb-block-grid--area-row-span` |

## Decision

The package only provides **numbers**.

- **To views**, as data the site's partials can read.
- **As CSS variables**, using core's names with the layout identifier on the end:
  - `--umb-block-grid--area-grid-columns--md`
  - `--umb-block-grid--area-column-span--md`
  - `--umb-block-grid--area-row-span--md`
  - `--umb-block-grid--area-order--md`

The base layout keeps core's variables unchanged.
Core has no order variable. The base layout uses source order.

## Consequences

- **No framework in the package.** Each site maps the numbers to its own CSS.
- **The names sit naturally beside core's**, ready for a core proposal.
- **Identifiers must be valid in CSS names.** Letters, numbers, hyphens and underscores only.
