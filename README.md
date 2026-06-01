# API Explorer

A modern OpenAPI 3.x UI you can embed in any page with a single function call. Built with React 19 + TypeScript, delivered as a self-contained IIFE — no framework required on the consumer side.

## Features

- **OpenAPI 3.0 & 3.1** — JSON and YAML
- **Try it out** — send real HTTP requests directly from the browser
- **Authentication** — API key, HTTP Bearer/Basic, OAuth 2.0, OpenID Connect
- **Schema browser** — explore component schemas with full property trees
- **Dark mode** — toggle or follows system preference, persisted across sessions
- **Resizable panes** — drag to resize nav, detail, and try-it panels
- **Deep linking** — every endpoint and schema has a shareable URL (`#endpoints/…`, `#schemas/…`)
- **Keyboard-first** — navigate entirely without a mouse

---

## Quick start

Add a container element, load the script from jsDelivr, and call `mountApiExplorer`:

```html
<!doctype html>
<html style="height:100%">
<body style="height:100%;margin:0">

  <div id="api-docs" style="height:100%"></div>

  <script src="https://cdn.jsdelivr.net/gh/openapiui/open-api-ui@v0.1.0-beta.2/dist/loader.js"></script>
  <script>
    ApiExplorer.mountApiExplorer(
      document.getElementById('api-docs'),
      { url: 'https://petstore3.swagger.io/api/v3/openapi.json' }
    );
  </script>

</body>
</html>
```

The script injects all required styles and fonts — no separate CSS import needed.

> **Container height** — the explorer fills its container via `height: 100%`. Give the container an explicit height (e.g. `height: 100vh` or `height: 600px`), otherwise it collapses to zero.

---

## API

### `mountApiExplorer(target, options?)`

Mounts the explorer into `target` and returns a cleanup function that unmounts it.

```ts
const unmount = ApiExplorer.mountApiExplorer(
  document.getElementById('api-docs'),
  { url: 'https://api.example.com/openapi.json' }
);

// later, to tear down:
unmount();
```

| Option | Type | Description |
|--------|------|-------------|
| `url`  | `string` | URL of the OpenAPI spec to load on startup (JSON or YAML). |

---

## Integration examples

### React

```tsx
import { useEffect, useRef } from 'react';

export function ApiDocs() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const unmount = ApiExplorer.mountApiExplorer(ref.current, {
      url: '/openapi.json',
    });
    return unmount;
  }, []);

  return <div ref={ref} style={{ height: '100vh' }} />;
}
```

### Vue 3

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue';

const container = useTemplateRef('container');
let unmount: (() => void) | undefined;

onMounted(() => {
  unmount = ApiExplorer.mountApiExplorer(container.value!, {
    url: '/openapi.json',
  });
});

onUnmounted(() => unmount?.());
</script>

<template>
  <div ref="container" style="height: 100vh" />
</template>
```

### Plain HTML (self-hosted)

If you host `loader.js` yourself instead of using jsDelivr:

```html
<div id="api-docs" style="height:100vh"></div>
<script src="/assets/loader.js"></script>
<script>
  ApiExplorer.mountApiExplorer(
    document.getElementById('api-docs'),
    { url: '/openapi.json' }
  );
</script>
```

---

## Deep linking

Every endpoint and schema gets its own URL fragment:

| Fragment | Links to |
|----------|----------|
| `#endpoints/getPetById` | Endpoint by `operationId` |
| `#endpoints/GET%3A%2Fpets%2F%7Bid%7D` | Endpoint by method + path (when no `operationId`) |
| `#schemas/Pet` | Component schema |

The fragment updates automatically as you navigate — copying the URL always gives a shareable deep link.

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus endpoint search |
| `↑` `↓` | Navigate endpoints |
| `Enter` | Select focused endpoint |
| `Esc` | Close modal / dismiss |
| `⌘ K` | Open command bar |
| `⌘ ↵` | Send request (Try it out) |
| `?` | Toggle shortcuts panel |

---

## Development

```bash
git clone https://github.com/openapiui/open-api-ui
cd open-api-ui
npm install
npm run dev        # Vite dev server at http://localhost:5173
```

Place an `openapi.json` at the project root and it will load automatically, or use the load modal to point at any spec URL.

### Build

```bash
npm run typecheck   # type-check only
npm run build:lib   # builds dist/loader.js (embeddable IIFE)
npm run build       # builds the full standalone app
```

### Releasing

```bash
git tag v0.x.y
git push origin v0.x.y
```

The CI pipeline builds `loader.js` and attaches it to the tag. The jsDelivr CDN URL is then live at:

```
https://cdn.jsdelivr.net/gh/openapiui/open-api-ui@v0.x.y/dist/loader.js
```

---

## License

MIT