# Releasing Atelier

Atelier is a [mono-repository][mono-repo], handled by NPM.

## Conventions

Since the tool is not opinionated, here are the conventions we use.

1. Use conventional commit.

   > This is the key to Change log generation and semantic versionning.

2. Release all at once.

   > To avoid discrepancies between modules.

3. All packages must use the same version number.

   > It makes usage easier: when they bump one, they should bump all.

4. Publish artifacts on NPM repository

   > It is our repository of choice.

5. We bump from `main` branch.

   > Otherwise, it's an open door to all windows.

## How to

1. At root level, `pnpm release`

   It generates CHANGELOG.md, bumps versions in packages.json files, creates a git tag.

2. Includes automatically formatted files: `git add -A`

3. Push commit and tags: `git push --follow-tags origin main`

4. Using CLI, log into NPM, `npm login`

5. Get your NPM OTP ready, then publish all packages: `npm publish --workspaces ---access public -otp $OTP`

[mono-repo]: https://en.wikipedia.org/wiki/Monorepo
