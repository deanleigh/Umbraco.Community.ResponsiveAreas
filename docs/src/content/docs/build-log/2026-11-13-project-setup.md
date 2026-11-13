---
title: "13 Nov 2026: Project setup"
description: Builder Day. Repository, test site, package project and docs set up.
---

Umbraco Builder Day.
No package code yet. This session set up the project.

## Test site

- Created from the UmBootstrap NuGet template.
- Installed with SQLite.
- UmBootstrap is the test bed only. The package does not depend on it.

## Upgrade to Umbraco 17.8.0

The template shipped Umbraco 17.2.2.
We upgraded before writing any code, while it was cheap.

- Package versions match a live UmBootstrap-based site already running 17.8.0.
- Two security pins (MimeKit, ImageSharp) were removed. Newer Umbraco 17 resolves fixed versions itself, so the pins would have become downgrades.

## Package project

- Created with `dotnet new umbraco-extension`.
- TypeScript, Vite and Lit live in `Client/`.
- Vite builds into the package's `wwwroot`.

The template sets Umbraco versions to `*`, meaning "latest".
That resolved to Umbraco 18, which would clash with a 17 test site.
All Umbraco versions are now pinned exactly.

NuGet metadata was added from the start.
If the core PR is declined, this ships as a package.

## Source reference

The Umbraco CMS source is checked out at the `release-17.8.0` tag.
It is the primary reference for how core builds the Areas tab.

## Docs

- This Starlight site lives on the `docs/site` branch.
- Sections follow Diátaxis, plus Decisions and this Build log.
- The build fails if a local machine path appears in the output.

## Step 1: replace the Areas tab

Core's Areas tab is a `workspaceView` with the alias `Umb.WorkspaceView.BlockType.Grid.Areas`.
It shows on the Block Grid block type workspace, with a weight of 1000.

The view itself is small.
It is a box holding two standard property editors:

- **Grid Columns for Areas** (`areaGridColumns`), an integer field.
- **Areas** (`areas`), the grey boxes.

We registered our own `workspaceView` with `overwrites` pointing at core's alias.
It shows "Hello Areas" for now.

### What we confirmed

- **`overwrites` replaces the tab.** There is still only one Areas tab. The registry removes core's view once ours passes its conditions.
- **If our conditions fail, core's tab stays.** The block type can never end up with no Areas tab.

### Tab order

All three core tabs have a weight of 1000.
Ours sorts after them, so the order is now Settings, Advanced, Areas.
A different weight could move it first, but not between the other two.
Left as it is for now.

### Found in core along the way

- **Empty Grid Columns shows as invalid.** Core sets a minimum of 1 on the field. Empty is valid (it means "inherit"), but the field still shows "Value must be greater than or equal to '1'". Our tab should handle this properly.
- **Keyboard resizing has been started.** Each area box has a keyboard-resize button, labelled "TODO: Some introduction to keyboard scaling". We can build on it.

## Step 2: storage test

Question: if we add our own properties to area objects and the block type, does Umbraco keep them?

Yes.
They survive a data type save, a resize and an edit in the area settings modal.
Full details are in [Decision 001: Store layouts inline](/decisions/001-store-layouts-inline/).

Along the way, the replacement tab gained core's two editors back.
It now looks and works exactly like core's Areas tab.
Layouts get added on top of that.

## Next

Start the layouts UI: a list of layouts under the base layout, with "Add layout".
