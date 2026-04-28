# TeamGaga MiniApp JS SDK

JavaScript SDK for TeamGaga miniapps running inside the TeamGaga App Flutter WebView container.

## Build

```sh
pnpm --filter @teamgaga/miniapp-js-sdk build
```

The build emits ES5 IIFE bundles for WebView injection:

- `dist/index.iife.js`
- `dist/index.iife.min.js`
- `dist/index.d.ts`

## Usage

```html
<script src="./dist/index.iife.min.js"></script>
<script>
  TeamGagaMiniApp.getUserId().then(function (userId) {
    console.log(userId);
  });
</script>
```

The Flutter WebView host should expose `tgg.postMessage`.
Native responses are completed by calling `TeamGagaMiniApp.resolve(id, value)` or
`TeamGagaMiniApp.reject(id, error)`.
