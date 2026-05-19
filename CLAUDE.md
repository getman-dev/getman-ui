# API Explorer — Claude context

> **Maintenance rule**: keep this file up to date. Whenever the architecture, file structure, conventions, or key decisions change, update the relevant section before finishing the task.

An OpenAPI 3.x UI embedded via a `mountApiExplorer(target, options)` function. Built with **React 19 + TypeScript**, Vite, and Tailwind. No Shadow DOM.

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:5173
npm run build        # full app build
npm run build:lib    # single IIFE bundle (dist/loader.js) for embedding
npm run typecheck    # tsc --noEmit
```

Place an `openapi.json` at the project root to load it automatically in dev.

## Project structure

Feature-based layout: each feature owns its context, components, and local logic. Cross-cutting concerns live in `shared/`.

```
src/
  App.tsx             # Root component: AppProviders wrapper + AppInner (layout, dark mode,
                      # keyboard shortcuts, hash routing, initResizablePanes)
  mount.ts            # mountApiExplorer(target, options) — creates a React root and renders App
  loader.ts           # Library entry — injects fonts + styles, re-exports mountApiExplorer
  main.tsx            # Dev entry — imports styles, re-exports mountApiExplorer
  features/
    spec/
      openapi.ts        # TypeScript interfaces for OpenAPI 3.x spec + internal app types
      spec-context.tsx  # spec + groups (parsed TagGroup[])
      spec-parser.ts    # parseSpec — builds TagGroup[] from spec, merges path+op params
      ref-resolver.ts   # resolveRef / resolveSchema / resolveParameter / resolveResponse
      example-gen.ts    # schemaToExample, getRequestBodyExample, getResponseExample,
                        # getSuccessResponse, buildUrl, resolveServerUrl
    nav/
      nav-context.tsx   # searchQuery, sidebarTab, activeEndpoint, activeSchema
      Nav.tsx           # Sidebar: endpoint list, schema list, search, tabs
      DetailPane.tsx    # Routes between EndpointDetail, SchemaDetail, and empty state
    endpoint/
      EndpointDetail.tsx # Endpoint documentation view (params, body, responses accordion)
    playground/
      playground-context.tsx # params, bodyValue, files, response, loading, endpoint
      Playground.tsx    # Try-it-out panel: params, body, auth, request/response
    auth/
      auth-context.tsx  # authValues, authModalVisible
      AuthModal.tsx     # Auth configuration modal
    server/
      server-context.tsx # selectedServer, serverVariables, serverPopoverSource
      ServerConfig.tsx  # Server URL chip + variable editor (used by TopBar and Playground)
    schema/
      SchemaViewer.tsx  # Tabbed schema + example viewer
      SchemaNode.tsx    # Recursive schema property renderer (self-imports)
      SchemaDetail.tsx  # Component schema detail view
  shared/
    contexts/
      index.tsx         # AppProviders composition + re-exports from all context modules
      modal-context.tsx # modalVisible, modalError, modalUrlValue, shortcutsVisible, commandBarVisible
    components/
      Modal.tsx         # Reusable modal shell
      LoadModal.tsx     # Spec loader modal (URL or file upload)
      CommandBar.tsx    # ⌘K command palette
      TopBar.tsx        # Header: title, server selector, dark mode, auth button
    state/
      actions.ts        # Cross-context operations: selectEndpoint, selectSchema, applySpec,
                        # executePlayground, loadSpecFromUrl, loadSpecFromFile, restoreFromHash
    utils/
      html.ts           # escapeHtml (used by highlight.ts for safe JSON colorization)
      badges.ts         # methodBadgeClasses (HTTP method → Tailwind color classes)
      highlight.ts      # JSON syntax highlighting (regex-based, size-limited)
      http-client.ts    # executeRequest — wraps fetch for Try-it-out
      resizable-panes.ts  # Drag-to-resize pane logic (called once in AppInner useEffect)
  style.css           # Global styles + Tailwind
  vite-env.d.ts       # Vite client type declarations
```

### Feature ownership

| Feature | Owns | Depends on |
|---|---|---|
| `spec` | OpenAPI types, parser, ref resolver, example gen, spec context | — |
| `nav` | Sidebar, detail pane router, nav context | `spec`, `endpoint`, `schema` |
| `endpoint` | Endpoint documentation view | `spec`, `nav`, `schema` |
| `playground` | Try-it-out panel, playground context | `spec`, `auth`, `server` |
| `auth` | Auth modal, auth context | `spec` |
| `server` | Server chip + variable editor, server context | `spec` |
| `schema` | Schema viewer and recursive node renderer | `spec` |
| `shared` | Modal shell, load modal, command bar, top bar, actions, utils | all features |

## Architecture

**Framework**: React 19 with TypeScript. Components are `.tsx` files; reactive state lives in React context modules under `src/features/*/` and `src/shared/contexts/`.

**State**: Six focused React contexts, one per feature concern. Each context module exports:
- A `XxxProvider` component and `useXxx()` hook for components.
- A module-level `xxxSnapshot` object updated **synchronously** on every setter call (eager snapshot pattern).
- A `xxxActions` object whose setter functions are populated after the first render.

The eager snapshot pattern lets `actions.ts` read consistent state synchronously across chained calls (e.g. `applySpec` sets spec then immediately calls `restoreFromHash`) without waiting for React re-renders. `AppProviders` in `shared/contexts/index.tsx` composes all six providers.

**Cross-context operations**: `shared/state/actions.ts` imports `xxxSnapshot` for reads and `xxxActions` for writes. Components import context hooks (`useXxx()`) for reads and may call `xxxActions` directly for fire-and-forget writes.

**Routing**: Hash-based (`#endpoints/<operationId>`, `#schemas/<Name>`). `restoreFromHash()` in `shared/state/actions.ts` is called on spec load and on `hashchange`. Navigation actions (`selectEndpoint`, `selectSchema`) write to `history` directly.

**Mount function**: `mountApiExplorer(target, options?)` in `mount.ts` calls `createRoot(target).render(createElement(App, { initialUrl: options?.url }))` and returns an unmount cleanup function. Consumers call it from any JS context — query params, config objects, etc.

**OpenAPI refs**: `$ref` strings are resolved at render time using `resolveRef` from `features/spec/ref-resolver.ts`. `parseSpec` pre-merges path-level and operation-level parameters (operation wins on `name+in` conflict). Response `$ref`s are resolved via `resolveResponse` at point of use.

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

## Key types (features/spec/openapi.ts)

- `OpenAPISpec` — top-level parsed spec
- `EndpointEntry` — `{ method, path, operation, tag }` — what the nav and detail views operate on
- `TagGroup` — `{ name, endpoints[] }` — one collapsible nav section
- `PlaygroundResponse` — response captured from Try-it-out
- `HttpMethod` — union of supported HTTP verbs
- `AuthValues` / `AuthSchemeValue` — per-scheme auth credentials keyed by scheme name
