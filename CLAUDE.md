# Claude Instructions

## NEVER TAG A RELEASE

**Do not run `git tag`. Do not run `git push origin <tag>`. Ever.**

Dean tags every release by hand. Write the commands out for him to run and stop there.

Once a release workflow exists, the tag **is** the published NuGet version. Pushing a tag publishes a package. It cannot be taken back.

---

## Session Startup

1. Read the documentation first. It is the source of truth for what ResponsiveAreas is and the decisions behind it. A previous session wrote it; that context is gone.
   Docs live in the docs worktree at `.worktrees/docs/` (see `WORKTREES.md`).
2. Take version numbers from the `.csproj` files, never from docs or this file.
3. Note anything missing or wrong in the docs as you read.

## What This Is

An Umbraco package that replaces the Block Grid block type **Areas** tab with a responsive version: multiple area layouts per block, each with its own column count, area spans and order. Package first, with the long-term aim of proposing it to Umbraco core. If core declines, it ships on NuGet, so build it release-ready from the start.

## Principles

- **The docs are the source of truth.** No PLAN.md / TODO.md as the master record.
- **Document as you go.** Every session that changes code updates the docs and adds a build log entry.
- **No Bootstrap dependency in the package.** No CSS framework assumptions in `src/Umbraco.Community.ResponsiveAreas`.

## Test Site Isolation

`src/ResponsiveAreas.TestSite` is built from UmBootstrap. UmBootstrap is **only the test bed**.

The test: *does the package need this to work?* If not, it stays in the test site. Bootstrap classes, UmBootstrap views, helpers and SCSS never move into the package. Hand-written CSS that maps layout identifiers to media queries belongs in the test site, as an example of what a site does.

## Project Structure

- `src/Umbraco.Community.ResponsiveAreas/` is the Razor Class Library: the NuGet package. TypeScript source in `Client/`, Vite builds into `wwwroot/App_Plugins/UmbracoCommunityResponsiveAreas/` (committed, ships in the package).
- `src/ResponsiveAreas.TestSite/` is the Umbraco host site. References the package via `<ProjectReference>`.
- `ResponsiveAreas.slnx` is the solution at the repo root.

## Branching

Work directly on `main` for now. No `develop` or feature branches until Dean says otherwise. Still ask before committing or pushing.

## GitHub Issues

Before non-trivial work, check `gh issue list`. If there is no issue, ask whether to create one. Reference issues in commits (`Closes #12`). Not needed for trivial changes.

## Naming Conventions

| Context | Format | Value |
|---------|--------|-------|
| Brand / display | PascalCase | ResponsiveAreas |
| NuGet package / C# namespace | Dot notation | `Umbraco.Community.ResponsiveAreas` |
| Umbraco extension aliases | Dot notation | `ResponsiveAreas.*` |
| App_Plugins folder | PascalCase | `App_Plugins/UmbracoCommunityResponsiveAreas/` |
| npm package | kebab-case | `umbraco-community-responsive-areas` |
| File names | kebab-case | `responsive-areas-workspace-view.element.ts` |
| Custom HTML elements | kebab-case | `<responsive-areas-...>` |

## Reference Sources

Match the version the test site runs (check the csproj).

1. **Umbraco CMS source** (primary reference). A git worktree checked out at the matching release tag:
   `D:\Users\deanl\source\repos\Umbraco Extensions\Umbraco-CMS-17.8.0`
   Backoffice code is in `src/Umbraco.Web.UI.Client/src/packages/`. Before implementing anything, find how core does it. If the test site's Umbraco version changes, add a new worktree at the new tag; leave the original `Umbraco-CMS` clone alone (other projects use it).
2. **Installed UUI source**: `src/Umbraco.Community.ResponsiveAreas/Client/node_modules/@umbraco-ui/uui`. Exactly what runs.
3. **UUI Storybook**: https://uui.umbraco.com/ shows the latest UUI. Check a component exists in the installed version before using it.
4. **Umbraco backoffice API docs**: https://apidocs.umbraco.com/v17/ui/

The Umbraco skills and online docs are supplementary. The source is definitive.

## Never Build or Run

**Never run `dotnet build`, `dotnet run` or `dotnet watch`.** Dean builds and runs the test site. When a change needs a build or restart, stop and ask him, then continue once he confirms. Enforced by `.claude/settings.json`.

Frontend-only `npm run build` in `Client/` is fine.

## Docs Worktree

Docs are an Astro Starlight site on the `docs/site` branch, checked out at `.worktrees/docs/`. Before editing any docs file, check the absolute path is under `.worktrees/docs/`. Commit and push docs changes as you make them.

## No Local-Machine Paths in Public Docs

Never put local paths (`D:\Users\...`, `C:\...`, usernames) in published docs. Link to public GitHub URLs instead. This file and other developer-facing files may contain local paths.
