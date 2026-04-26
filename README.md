# API Explorer

A modern, zero-dependency OpenAPI UI delivered as a Web Component. Drop one tag into any page to get a full-featured interactive API reference — no framework required.

![API Explorer screenshot](https://placeholder.com/screenshot.png)

## Features

- **OpenAPI 3.0 & 3.1** — JSON and YAML
- **Try it out** — send real HTTP requests directly from the browser
- **Authentication** — API key, HTTP Bearer/Basic, OAuth 2.0, OpenID Connect
- **Schema browser** — explore component schemas with full property trees
- **Dark mode** — toggle or follows system preference, persisted across sessions
- **Resizable panes** — drag to resize nav, detail, and try-it panels
- **Deep linking** — every endpoint and schema has a shareable URL (`#endpoints/…`, `#schemas/…`)
- **Keyboard-first** — navigate entirely without a mouse
- **No framework** — plain Web Component, works in React, Vue, Angular, or raw HTML

---

## Quick start

### CDN (no install)

```html
<!doctype html>
<html style="height:100%">
<body style="height:100%;margin:0">
  <api-explorer
    url="https://petstore3.swagger.io/api/v3/openapi.json"
    style="height:100%;display:block"
  ></api-explorer>

  <script src="https://unpkg.com/@openapi-explorer/ui@latest/dist/loader.js"></script>
</body>
</html>
```

The loader script self-registers the `<api-explorer>` element and injects its styles — no separate CSS import needed.

### npm

```bash
npm install @openapi-explorer/ui
```

```js
// registers <api-explorer> globally, injects styles
import '@openapi-explorer/ui';
```

```html
<api-explorer url="/openapi.json" style="height:600px;display:block"></api-explorer>
```

---

## Attributes

| Attribute | Type   | Description |
|-----------|--------|-------------|
| `url`     | string | URL of the OpenAPI spec to load (JSON or YAML). Also readable from `?url=` query param. Supports live updates — changing the attribute reloads the spec. |

### Loading via query param

If you host the explorer on a dedicated page you can pass the spec URL without touching the HTML:

```
https://yoursite.com/docs?url=https://api.example.com/openapi.json
```

---

## Integration examples

### React

```tsx
// api-explorer.d.ts — add once to your project
declare namespace JSX {
  interface IntrinsicElements {
    'api-explorer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & { url?: string },
      HTMLElement
    >;
  }
}
```

```tsx
// App.tsx
import '@openapi-explorer/ui';

export function ApiDocs() {
  return (
    <api-explorer
      url="/openapi.json"
      style={{ height: '100vh', display: 'block' }}
    />
  );
}
```

### Vue 3

```ts
// main.ts
import { createApp } from 'vue';
import '@openapi-explorer/ui';
import App from './App.vue';

// tell Vue to skip api-explorer (it's a custom element)
createApp(App)
  .config.compilerOptions.isCustomElement = (tag) => tag === 'api-explorer';

createApp(App).mount('#app');
```

```vue
<!-- ApiDocs.vue -->
<template>
  <api-explorer url="/openapi.json" style="height:100vh;display:block" />
</template>
```

### Angular

```ts
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '@openapi-explorer/ui';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

```html
<!-- api-docs.component.html -->
<api-explorer url="/openapi.json" style="height:100vh;display:block"></api-explorer>
```

### Plain HTML (self-hosted)

Download the build artifacts (`loader.js`) and serve them yourself:

```html
<api-explorer url="/openapi.json" style="height:100%;display:block"></api-explorer>
<script src="/assets/loader.js"></script>
```

---

## Deep linking

Every endpoint and schema gets its own URL fragment, so you can link directly to any part of the API:

| Fragment | Links to |
|----------|----------|
| `#endpoints/getPetById` | Endpoint by `operationId` |
| `#endpoints/GET%3A%2Fpets%2F%7Bid%7D` | Endpoint by method + path (when no operationId) |
| `#schemas/Pet` | Component schema |

The fragment is updated automatically as you navigate, so copying the URL always gives a shareable deep link.

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus endpoint search |
| `↑` `↓` | Navigate endpoints |
| `Enter` | Select focused endpoint |
| `Esc` | Close modal / dismiss |
| `⌘ K` | Open spec loader |
| `⌘ ↵` | Send request (Try it out) |
| `?` | Toggle shortcuts panel |

---

## Development

```bash
git clone https://github.com/your-org/openapi-explorer
cd openapi-explorer
npm install
npm run dev        # starts Vite dev server at http://localhost:5173
```

Place an `openapi.json` file in the project root and it will be served automatically, or set the `url` attribute to any reachable spec URL.

### Build

```bash
npm run build       # builds the full app (index.html + assets)
npm run build:lib   # builds the embeddable loader (dist/loader.js)
```

The library build produces a single self-contained IIFE bundle that registers the Web Component and injects all required styles. No external dependencies at runtime.

### Project structure

```
src/
├── app.ts                  # App state, event wiring, routing
├── element.ts              # <api-explorer> Web Component definition
├── loader.ts               # Library entry point (fonts + styles + registration)
├── main.ts                 # Dev entry point
├── components/
│   ├── top-bar.ts          # Top bar (title, server, auth, controls)
│   ├── load-modal.ts       # Spec loader modal
│   └── auth-modal.ts       # Authentication modal
├── pages/
│   ├── EndpointDetailPage.ts   # Endpoint documentation view
│   └── SchemaDetailPage.ts     # Schema detail view
├── renderer/
│   ├── nav.ts              # Navigation sidebar
│   └── try-it.ts           # Try-it-out panel
├── parser/
│   └── spec-parser.ts      # OpenAPI spec parsing and resolution
├── types/
│   └── openapi.ts          # TypeScript types for OpenAPI 3.x
└── utils/
    ├── highlight.ts        # JSON syntax highlighting
    ├── http-client.ts      # Fetch wrapper for Try it out
    └── resizable-panes.ts  # Drag-to-resize pane logic
```

---

## Browser support

Any browser that supports [Custom Elements v1](https://caniuse.com/custom-elementsv1) and [ES modules](https://caniuse.com/es6-module) — all modern browsers (Chrome 67+, Firefox 63+, Safari 10.3+, Edge 79+).

---

## License

MIT