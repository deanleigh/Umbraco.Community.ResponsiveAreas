# Worktrees

ResponsiveAreas uses one git worktree, for documentation.

```
Umbraco.Community.ResponsiveAreas/                  main working directory, code
Umbraco.Community.ResponsiveAreas/.worktrees/docs/  docs worktree, always on docs/site
```

Both are the same repository. Two folders, two branches, one `.git`.

## Why

Documentation does not get written when it competes with in-flight code for the same working directory. The worktree removes that. When something needs documenting, open the docs worktree, write it, commit, push. The code branch never moves.

Docs also deploy the moment they are pushed, without waiting for code to merge.

## The rules

1. **Never edit `docs/` from the main working directory.** The same files exist on `main`. Edit them in the worktree.
2. **Check the path before editing any docs file.** The two folders look identical in an editor. The path is the only way to tell.
3. **Commit and push docs changes as you make them.** Do not batch.
4. **Docs that are genuinely part of a code change can travel with the code.** The worktree is for documentation that stands alone.

## Working in it

First time only, after cloning:

```bash
git worktree add .worktrees/docs docs/site
cd .worktrees/docs/docs
npm install
```

To preview locally:

```bash
cd .worktrees/docs/docs
npm run dev
```

## Keeping it current

`docs/site` is a permanent branch. It drifts from `main` over time, which is fine. To bring current code into the docs worktree:

```bash
cd .worktrees/docs
git merge main
```

## Deployment

Cloudflare Pages project `responsive-areas-docs` (not yet created).

| Setting | Value |
|---------|-------|
| Production branch | `docs/site` |
| Root directory | `docs` |
| Build command | `npm run build` |
| Build output directory | `dist` |

The production branch **must** be `docs/site`. If it is left as `main`, Pages silently serves a frozen copy (learned on Tailored Travel). Check the live site after each deploy.
