# TeamGaga SDK JS

JavaScript and TypeScript monorepo for the TeamGaga Open Platform SDK.

## Structure

```text
libs/sdk
examples/dice-bot
```

## Install

```bash
vp install
```

## Common Commands

```bash
pnpm run ready
pnpm run check
pnpm run fmt
vp run sdk#build
vp run sdk#test
vp run dice-bot#start
```

`libs/sdk` contains the publishable `@teamgaga/sdk` package. `examples/dice-bot` contains the getting-started bot example.

## Release

Before automated npm releases, configure npm Trusted Publishing for `@teamgaga/sdk`:

- Publisher: GitHub Actions
- Owner: `AlbertaMoulton`
- Repository: `sdk-js`
- Workflow filename: `publish.yml`

npm currently requires the package to exist before Trusted Publishing can be configured. If `@teamgaga/sdk` has never been published, publish the first version manually with npm access, then enable Trusted Publishing for later releases.

Then create a release from `main`:

```bash
pnpm run release:patch
git push origin main v0.1.1
```

Use `release:minor` or `release:major` when needed. The release script updates `libs/sdk/package.json`, runs `pnpm run ready`, checks the package with `pnpm pack --dry-run`, commits the version bump, and creates the `v*` tag. GitHub Actions publishes the tag to npm.
