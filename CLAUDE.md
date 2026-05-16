# API Explorer — Claude context

> **Maintenance rule**: keep this file up to date. Whenever the architecture, file structure, conventions, or key decisions change, update the relevant section before finishing the task.

An OpenAPI 3.x UI delivered as a Web Component (`<api-explorer>`). Built with **Svelte 5 + Runes**, Vite, and Tailwind. No Shadow DOM.

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:5173
npm run build        # full app build
npm run build:lib    # single IIFE bundle (dist/loader.js) for embedding
npm run typecheck    # tsc --noEmit
```

Place an `openapi.json` at the project root to load it automatically in dev.

## Project structure

```
src/
  App.svelte          # Root Svelte component: layout, dark mode, keyboard shortcuts, hash routing
  element.ts          # ApiExplorerElement web component — mounts/unmounts App via Svelte's mount()
  loader.ts           # Library entry — registers custom element, injects fonts + styles
  main.ts             # Dev entry — registers custom element (no font/style injection)
  svelte-runes.d.ts   # Ambient declarations for Svelte 5 rune globals ($state, $derived, etc.)
  components/
    Nav.svelte         # Sidebar: endpoint list, schema list, search, tabs
    TopBar.svelte      # Header: title, server selector, dark mode, auth button
    Playground.svelte  # Try-it-out panel: params, body, auth, request/response
    AuthModal.svelte   # Auth configuration modal
    LoadModal.svelte   # Spec loader modal (URL or file upload)
    ServerConfig.svelte # Server URL chip + variable editor (used by TopBar and Playground)
    SchemaViewer.svelte # Tabbed schema + example viewer
    SchemaNode.svelte   # Recursive schema property renderer (self-imports)
  pages/
    DetailPane.svelte   # Routes between EndpointDetail, SchemaDetail, and empty state
    EndpointDetail.svelte # Endpoint documentation view (params, body, responses accordion)
    SchemaDetail.svelte   # Component schema detail view
  state/
    spec-state.svelte.ts      # specState: spec + groups
    nav-state.svelte.ts       # navState: search, tab, active endpoint/schema
    server-state.svelte.ts    # serverState: selected server, variables, popover source
    auth-state.svelte.ts      # authState: credentials, modal visibility
    playground-state.svelte.ts # playgroundState: params, body, files, response, loading
    modal-state.svelte.ts     # modalState: load modal + shortcuts overlay
    actions.ts                # Cross-store operations: selectEndpoint, selectSchema, applySpec,
                              # executePlayground, loadSpecFromUrl, loadSpecFromFile, restoreFromHash
  parser/
    spec-parser.ts    # parseSpec — builds TagGroup[] from spec, merges path+op params
    ref-resolver.ts   # resolveRef / resolveSchema / resolveParameter / resolveResponse
    example-gen.ts    # schemaToExample, getRequestBodyExample, getResponseExample,
                      # getSuccessResponse, buildUrl, resolveServerUrl
  types/
    openapi.ts        # TypeScript interfaces for OpenAPI 3.x spec + internal app types
  utils/
    html.ts           # escapeHtml (used by highlight.ts for safe JSON colorization)
    badges.ts         # methodBadgeClasses (HTTP method → Tailwind color classes)
    highlight.ts      # JSON syntax highlighting (regex-based, size-limited)
    http-client.ts    # executeRequest — wraps fetch for Try-it-out
    resizable-panes.ts  # Drag-to-resize pane logic (called once after mount in element.ts)
  style.css           # Global styles + Tailwind
  vite-env.d.ts       # Vite client type declarations
```

## Architecture

**Framework**: Svelte 5 with Runes. Components are `.svelte` files; reactive state lives in `.svelte.ts` modules using `$state()`.

**State**: Six focused `$state` objects in `src/state/` (one per concern). All are module-level singletons — components import and mutate them directly. Cross-store operations (e.g. selecting an endpoint also resets playground state) live in `actions.ts`.

**Reactivity**: Svelte's compiler handles UI updates automatically via `$derived` and `$effect`. No manual subscriptions or `innerHTML =` calls.

**Routing**: Hash-based (`#endpoints/<operationId>`, `#schemas/<Name>`). `restoreFromHash()` in `actions.ts` is called on spec load and on `hashchange`. Navigation actions (`selectEndpoint`, `selectSchema`) write to `history` directly.

**Web Component**: `ApiExplorerElement` in `element.ts` calls `mount(App, { target: this, props: { initialUrl } })` in `connectedCallback` and `unmount()` in `disconnectedCallback`. `initResizablePanes` is called synchronously after `mount` (Svelte renders to DOM synchronously). Attribute changes call `loadSpecFromUrl` from `actions.ts` directly.

**OpenAPI refs**: `$ref` strings are resolved at render time using `resolveRef` from `ref-resolver.ts`. `parseSpec` pre-merges path-level and operation-level parameters (operation wins on `name+in` conflict). Response `$ref`s are resolved via `resolveResponse` at point of use.

**Dark mode**: `App.svelte` holds `darkMode = $state(...)` initialized from `localStorage`/`prefers-color-scheme`. Applied as `class:dark={darkMode}` on the outermost div. Tailwind's `dark:` variants work because the div wraps the full UI.

**Playground visibility**: The try-pane and right resize handle use `style:display` bound to `!!navState.activeEndpoint`, keeping them in the DOM (so `initResizablePanes` handles work) but hidden when no endpoint is selected.

## Conventions

- Svelte 5 Runes everywhere: `$state`, `$derived`, `$derived.by()`, `$effect`, `$props()`.
- State mutations are direct property assignments (`navState.searchQuery = ""`), not method calls.
- Svelte auto-escapes interpolated values — never use `escapeHtml` inside `.svelte` templates.
- `{@html ...}` is only used for pre-highlighted JSON output from `highlightJson()`.
- TypeScript strict mode is on (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`). No `any`.
- `allowImportingTsExtensions: true` + `noEmit: true` in `tsconfig.json` — import `.svelte.ts` files with full extension.
- Tailwind only — no custom CSS except in `style.css` for structural/layout rules.
- **Every new exported function must have a JSDoc comment** describing what it does, its parameters, and its return value.
- **Every new `.svelte` or `.svelte.ts` file must have a top-of-file doc comment** (one or two sentences).
- Inline comments only when the *why* is non-obvious — not to describe what the code does.

## Key types (types/openapi.ts)

- `OpenAPISpec` — top-level parsed spec
- `EndpointEntry` — `{ method, path, operation, tag }` — what the nav and detail views operate on
- `TagGroup` — `{ name, endpoints[] }` — one collapsible nav section
- `PlaygroundResponse` — response captured from Try-it-out
- `HttpMethod` — union of supported HTTP verbs
- `AuthValues` / `AuthSchemeValue` — per-scheme auth credentials keyed by scheme name
- `TryItState`, `AppState`, `AppController` — **removed** (replaced by `$state` stores)
