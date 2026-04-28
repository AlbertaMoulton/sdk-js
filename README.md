# TeamGaga SDK JS

JavaScript and TypeScript monorepo for the TeamGaga Open Platform SDK.

## Structure

```text
libs/sdk
libs/miniapp-jssdk
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
vp run miniapp-jssdk#build
vp run miniapp-jssdk#test
vp run dice-bot#start
```

`libs/sdk` contains the publishable `@teamgaga/sdk` package. `libs/miniapp-jssdk` contains the publishable `@teamgaga/miniapp-jssdk` package for TeamGaga App WebView miniapps. `examples/dice-bot` contains the getting-started bot example.

## Release

Before automated npm releases, configure npm Trusted Publishing for each package:

- Publisher: GitHub Actions
- Owner: `AlbertaMoulton`
- Repository: `sdk-js`
- Workflow filename: `publish.yml`

npm currently requires a package to exist before Trusted Publishing can be configured. If a package has never been published, publish the first version manually with npm access, then enable Trusted Publishing for later releases.

Configure Trusted Publishing for both npm packages:

- `@teamgaga/sdk`
- `@teamgaga/miniapp-jssdk`

Then create a release from `main`.

For `@teamgaga/sdk`:

```bash
pnpm run release:sdk:patch
git push origin main v0.1.1
```

For `@teamgaga/miniapp-jssdk`:

```bash
pnpm run release:miniapp-jssdk:patch
git push origin main miniapp-jssdk-v0.1.1
```

Use `minor` or `major` release scripts when needed. The release script updates the selected package's `package.json`, runs `pnpm run ready`, checks the package with `pnpm pack --dry-run`, commits the version bump, and creates the release tag. GitHub Actions publishes the selected package to npm.

The legacy `release:patch`, `release:minor`, and `release:major` scripts still release `@teamgaga/sdk`.
