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

1. On every new PR, run `pnpm changeset` to add a change set for your modifications.

2. To create a version run `pnpm changeset version && pnpm i`

3. Review changes and commit.

4. Now publish your packages: `pnpm publish -r`, which will offer to log into NPM and provide your TOTP.

[mono-repo]: https://en.wikipedia.org/wiki/Monorepo
