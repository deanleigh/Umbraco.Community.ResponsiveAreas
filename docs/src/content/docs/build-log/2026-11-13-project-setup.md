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

## Next

Find core's Areas workspace view and replace it with a "Hello Areas" placeholder.
