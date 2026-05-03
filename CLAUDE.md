# API Explorer — Claude context

> **Maintenance rule**: keep this file up to date. Whenever the architecture, file structure, conventions, or key decisions change, update the relevant section before finishing the task.

A zero-dependency OpenAPI 3.x UI delivered as a Web Component (`<api-explorer>`). No framework, no Shadow DOM — plain TypeScript compiled with Vite + Tailwind.

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:5173
npm run build        # full app build
npm run build:lib    # single IIFE bundle (dist/loader.js) for embedding
npx tsc --noEmit     # type-check only
```

Place an `openapi.json` at the project root to load it automatically in dev.

## Project structure

```
src/
  app.ts              # All state, event wiring, hash routing, render orchestration
  element.ts          # ApiExplorerElement web component + HTML shell template
  loader.ts           # Library entry — registers custom element, injects fonts + styles
  main.ts             # Dev entry — registers custom element (no font/style injection)
  components/
    nav.ts            # Sidebar: endpoint list, schema list, search, tabs
    top-bar.ts        # Header: title, server selector, dark mode, auth button
    playground.ts         # Try-it-out panel: params, body, auth, request/response
    auth-modal.ts     # Auth configuration modal
    load-modal.ts     # Spec loader modal (URL or file upload)
  pages/
    endpoint-detail.ts  # Endpoint documentation view (params, body, responses)
    schema-detail.ts    # Component schema detail view
  parser/
    spec-parser.ts    # parseSpec — builds TagGroup[] from spec, merges path+op params
    ref-resolver.ts   # resolveRef / resolveSchema / resolveParameter / resolveResponse
    example-gen.ts    # schemaToExample, getRequestBodyExample, getResponseExample,
                      # getSuccessResponse, buildUrl
  types/
    openapi.ts        # TypeScript interfaces for OpenAPI 3.x spec + internal app types
  utils/
    html.ts           # escapeHtml, escapeAttr
    badges.ts         # methodBadgeClasses (HTTP method → Tailwind color classes)
    highlight.ts      # JSON syntax highlighting (regex-based, size-limited)
    http-client.ts    # executeRequest — wraps fetch for Try-it-out
    resizable-panes.ts  # Drag-to-resize pane logic
  style.css           # Global styles + Tailwind
  vite-env.d.ts       # Vite client type declarations
```

## Architecture

**Rendering**: every component is a pure function `(state) → HTML string`. `app.ts` calls `innerHTML =` on each pane after state changes. No virtual DOM, no diffing.

**State**: one flat `AppState` object in `app.ts`. All mutations happen there; components are stateless.

**Event binding**: after each render pass, `app.ts` re-queries the DOM and attaches listeners. Components export only render functions — no event logic.

**Routing**: hash-based (`#endpoints/<operationId>`, `#schemas/<Name>`). Managed entirely in `app.ts`.

**OpenAPI refs**: `$ref` strings are resolved at render time using `resolveRef` from `ref-resolver.ts`. `parseSpec` pre-merges path-level and operation-level parameters (operation wins on `name+in` conflict) so consumers always see a complete parameter list. Response `$ref`s are resolved via `resolveResponse` at the point of use in `endpoint-detail.ts`.

**Dark mode**: toggled by adding/removing the `dark` class on the component root element. Initial value comes from `localStorage` key `api-explorer-dark`, falling back to `prefers-color-scheme`.

**Public API surface**: `AppController` (`loadUrl`, `destroy`) is the only interface exposed outside `app.ts`. `ApiExplorerElement` in `element.ts` is what consumers interact with via the `url` attribute.

## Conventions

- All render functions return `string` (HTML). Naming: `render<Thing>(...)`.
- HTML escaping: always use `escapeHtml` / `escapeAttr` from `utils/html.ts` — never interpolate raw user/spec data.
- TypeScript strict mode is on (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`). No `any`.
- Tailwind only — no custom CSS except in `style.css` for structural/layout rules.
- **Every new exported function must have a JSDoc comment** describing what it does, its parameters, and its return value.
- **Every new file must have a top-of-file doc comment** (one or two sentences) stating its responsibility.
- Inline comments only when the *why* is non-obvious — not to describe what the code does.

## Key types (types/openapi.ts)

- `OpenAPISpec` — top-level parsed spec
- `EndpointEntry` — `{ method, path, operation, tag }` — what the nav and detail views operate on
- `TagGroup` — `{ name, endpoints[] }` — one collapsible nav section
- `TryItState` — all transient state for the try-it panel
- `AppState` — full application state (lives only in `app.ts`)
- `AppController` — public interface returned by `createApp` (`loadUrl`, `destroy`)
- `HttpMethod` — union of supported HTTP verbs
- `AuthValues` / `AuthSchemeValue` — per-scheme auth credentials keyed by scheme name