<div align="center">

# GetMan

**A beautiful, embeddable OpenAPI explorer — drop it anywhere with a single function call.**

[getman.dev](https://getman.dev) · [Live Demo](https://getman.dev/demo) · [Report a Bug](https://github.com/getman-dev/getman/issues)

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)
![Built with Vite](https://img.shields.io/badge/Vite-6.x-646cff?logo=vite&logoColor=white)

</div>

---

GetMan is a zero-dependency OpenAPI 3.x UI delivered as a single IIFE script. Point it at any spec URL, mount it into a
`<div>`, and get a fully interactive API explorer — with Try It Out, auth configuration, schema browsing, and deep
linking — in seconds.

No framework required on the consumer side. Works in React, Vue, Angular, plain HTML, or any server-rendered page.

---

## Features

- **OpenAPI 3.0 & 3.1** — JSON and YAML specs, loaded by URL or file upload
- **Try It Out** — send real HTTP requests directly from the browser
- **Authentication** — API key, HTTP Bearer / Basic, OAuth 2.0, OpenID Connect
- **Schema browser** — explore component schemas with expandable property trees
- **Dark mode** — toggle manually or follows system preference, persisted across sessions
- **Resizable panes** — drag to resize the nav, detail, and playground panels
- **Deep linking** — every endpoint and schema has a shareable URL (`#endpoints/…`, `#schemas/…`)
- **Command palette** — `⌘K` to jump anywhere without reaching for the mouse
- **Keyboard-first** — navigate entirely without a mouse

---

## Quick start

Add a container, load the script from jsDelivr, and call `mountApiExplorer`:

```html
<!doctype html>
<html style="height:100%">
<body style="height:100%;margin:0">

  <div id="api-docs" style="height:100%"></div>

  <script src="https://cdn.jsdelivr.net/gh/getman-dev/getman@v1.0.0/dist/loader.js"></script>
  <script>
      GetMan.mountApiExplorer(
      document.getElementById('api-docs'),
      { url: 'https://petstore3.swagger.io/api/v3/openapi.json' }
    );
  </script>

</body>
</html>
```

The script injects all required styles and fonts — no separate CSS import needed.

> **Container height** — GetMan fills its container via `height: 100%`. Give the container an explicit height (e.g.
`height: 100vh` or `height: 600px`), otherwise it will collapse to zero.

---

## API

### `GetMan.mountApiExplorer(target, options?)`

Mounts the explorer into `target` and returns a cleanup function.

```ts
const unmount = GetMan.mountApiExplorer(
  document.getElementById('api-docs'),
  { url: 'https://api.example.com/openapi.json' }
);

// later, to tear down:
unmount();
```

**Options**

| Option | Type     | Default | Description                                                |
|--------|----------|---------|------------------------------------------------------------|
| `url`  | `string` | —       | URL of the OpenAPI spec to load on startup (JSON or YAML). |

---

## Integration examples

### React

```tsx
import { useEffect, useRef } from 'react';

export function ApiDocs() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
      const unmount = GetMan.mountApiExplorer(ref.current, {
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
  unmount = GetMan.mountApiExplorer(container.value!, {
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
    GetMan.mountApiExplorer(
    document.getElementById('api-docs'),
    { url: '/openapi.json' }
  );
</script>
```

---

## Deep linking

Every endpoint and schema gets its own URL fragment. The fragment updates automatically as you navigate — copying the
URL always gives a shareable deep link.

| Fragment                              | Links to                                          |
|---------------------------------------|---------------------------------------------------|
| `#endpoints/getPetById`               | Endpoint by `operationId`                         |
| `#endpoints/GET%3A%2Fpets%2F%7Bid%7D` | Endpoint by method + path (when no `operationId`) |
| `#schemas/Pet`                        | Component schema by name                          |

---

## Keyboard shortcuts

| Key     | Action                     |
|---------|----------------------------|
| `/`     | Focus endpoint search      |
| `↑` `↓` | Navigate endpoints         |
| `Enter` | Select focused endpoint    |
| `Esc`   | Close modal / dismiss      |
| `⌘K`    | Open command palette       |
| `⌘↵`    | Send request (Try It Out)  |
| `?`     | Toggle shortcuts reference |

---

## Development

```bash
git clone https://github.com/getman-dev/getman
cd getman
npm install
npm run dev        # Vite dev server → http://localhost:5173
```

Place an `openapi.json` at the project root and it loads automatically, or use the load modal to point at any remote
spec URL.

### Build

```bash
npm run typecheck   # type-check only (tsc --noEmit)
npm run build:lib   # builds dist/loader.js — the embeddable IIFE
npm run build       # builds the full standalone app
```

### Releasing

Tag and push — CI builds `loader.js` and attaches it to the release. The jsDelivr CDN URL goes live immediately after:

```bash
git tag v1.x.y
git push origin v1.x.y
```

```
https://cdn.jsdelivr.net/gh/getman-dev/getman@v1.x.y/dist/loader.js
```

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change, then submit a pull request
against the `dev` branch.

---

## License

[MIT](./LICENSE) © GetMan