# API Explorer — Claude context

> **Maintenance rule**: keep this file up to date. Whenever the architecture, file structure, conventions, or key decisions change, update the relevant section before finishing the task.

An OpenAPI 3.x UI delivered as a Web Component (`<api-explorer>`). Built with **React 19 + TypeScript**, Vite, and Tailwind. No Shadow DOM.

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
  App.tsx             # Root component: AppProviders wrapper + AppInner (layout, dark mode,
                      # keyboard shortcuts, hash routing, initResizablePanes)
  element.ts          # ApiExplorerElement web component — mounts/unmounts App via createRoot()
  loader.ts           # Library entry — registers custom element, injects fonts + styles
  main.tsx            # Dev entry — registers custom element (no font/style injection)
  contexts/
    index.tsx          # AppProviders composition + re-exports from all context modules
    spec-context.tsx   # spec + groups (parsed TagGroup[])
    nav-context.tsx    # searchQuery, sidebarTab, activeEndpoint, activeSchema
    server-context.tsx # selectedServer, serverVariables, serverPopoverSource
    auth-context.tsx   # authValues, authModalVisible
    playground-context.tsx # params, bodyValue, files, response, loading, endpoint
    modal-context.tsx  # modalVisible, modalError, modalUrlValue, shortcutsVisible, commandBarVisible
  components/
    Nav.tsx            # Sidebar: endpoint list, schema list, search, tabs
    TopBar.tsx         # Header: title, server selector, dark mode, auth button
    Playground.tsx     # Try-it-out panel: params, body, auth, request/response
    AuthModal.tsx      # Auth configuration modal
    LoadModal.tsx      # Spec loader modal (URL or file upload)
    ServerConfig.tsx   # Server URL chip + variable editor (used by TopBar and Playground)
    SchemaViewer.tsx   # Tabbed schema + example viewer
    SchemaNode.tsx     # Recursive schema property renderer (self-imports)
    CommandBar.tsx     # ⌘K command palette
  pages/
    DetailPane.tsx     # Routes between EndpointDetail, SchemaDetail, and empty state
    EndpointDetail.tsx # Endpoint documentation view (params, body, responses accordion)
    SchemaDetail.tsx   # Component schema detail view
  state/
    actions.ts         # Cross-context operations: selectEndpoint, selectSchema, applySpec,
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
    resizable-panes.ts  # Drag-to-resize pane logic (called once in AppInner useEffect)
  style.css           # Global styles + Tailwind
  vite-env.d.ts       # Vite client type declarations
```

## Architecture

**Framework**: React 19 with TypeScript. Components are `.tsx` files; reactive state lives in React context modules in `src/contexts/`.

**State**: Six focused React contexts in `src/contexts/` (one per concern). Each context module exports:
- A `XxxProvider` component and `useXxx()` hook for components.
- A module-level `xxxSnapshot` object updated **synchronously** on every setter call (eager snapshot pattern).
- A `xxxActions` object whose setter functions are populated after the first render.

The eager snapshot pattern lets `actions.ts` read consistent state synchronously across chained calls (e.g. `applySpec` sets spec then immediately calls `restoreFromHash`) without waiting for React re-renders. `AppProviders` in `contexts/index.tsx` composes all six providers.

**Cross-context operations**: `actions.ts` imports `xxxSnapshot` for reads and `xxxActions` for writes. Components import context hooks (`useXxx()`) for reads and may call `xxxActions` directly for fire-and-forget writes.

**Routing**: Hash-based (`#endpoints/<operationId>`, `#schemas/<Name>`). `restoreFromHash()` in `actions.ts` is called on spec load and on `hashchange`. Navigation actions (`selectEndpoint`, `selectSchema`) write to `history` directly.

**Web Component**: `ApiExplorerElement` in `element.ts` calls `createRoot(this).render(createElement(App, { initialUrl }))` in `connectedCallback` and `_root.unmount()` in `disconnectedCallback`. Attribute changes call `loadSpecFromUrl` from `actions.ts` directly.

**OpenAPI refs**: `$ref` strings are resolved at render time using `resolveRef` from `ref-resolver.ts`. `parseSpec` pre-merges path-level and operation-level parameters (operation wins on `name+in` conflict). Response `$ref`s are resolved via `resolveResponse` at point of use.

**Dark mode**: `AppInner` holds `darkMode` via `useState`, initialized from `localStorage`/`prefers-color-scheme`. Applied as the `dark` class on the outermost div. `style.css` defines `@custom-variant dark (&:where(.dark, .dark *))` so all `dark:` Tailwind variants respond to that class on any ancestor.

**Playground visibility**: `#try-pane` and `#handle-right` use `style={{ display: showPlayground ? "" : "none" }}`, keeping them in the DOM (so `initResizablePanes` event handlers survive) but hidden when no endpoint is selected.

**`initResizablePanes` timing**: Called in a `useEffect` in `AppInner` via a `ref` on the root div. This runs after React's first DOM commit, ensuring all pane elements are present.

## Conventions

- React 19 functional components with hooks: `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`.
- Components read state via `useXxx()` context hooks. Fire-and-forget writes may use `xxxActions` directly.
- `actions.ts` uses snapshots for reads and action objects for writes — never imports React hooks.
- TypeScript strict mode is on (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`). No `any`.
- `dangerouslySetInnerHTML` is only used for pre-highlighted JSON output from `highlightJson()`.
- Tailwind only — no custom CSS except in `style.css` for structural/layout rules.
- `clsx` for conditional class names.
- **Every new exported function must have a JSDoc comment** describing what it does, its parameters, and its return value.
- **Every new `.tsx` file must have a top-of-file doc comment** (one or two sentences).
- Inline comments only when the *why* is non-obvious — not to describe what the code does.

## Key types (types/openapi.ts)

- `OpenAPISpec` — top-level parsed spec
- `EndpointEntry` — `{ method, path, operation, tag }` — what the nav and detail views operate on
- `TagGroup` — `{ name, endpoints[] }` — one collapsible nav section
- `PlaygroundResponse` — response captured from Try-it-out
- `HttpMethod` — union of supported HTTP verbs
- `AuthValues` / `AuthSchemeValue` — per-scheme auth credentials keyed by scheme name
