# Svelte Migration Roadmap

**Strategy**: Big-bang rewrite on a `feat/svelte` branch — nothing ships until all phases are done.  
**Svelte version**: Svelte 5  
**State**: Runes (`$state`, `$derived`, `$effect`) in `.svelte.ts` modules  
**Web Component**: Keep `<api-explorer>` — `element.ts` calls `mount(App, { target: this })` instead of `createApp()`  
**Build**: Plain Vite + `@sveltejs/vite-plugin-svelte` (no SvelteKit)

---

## Decisions already made

| Topic | Decision |
|---|---|
| Framework | Svelte 5 |
| State management | Runes in `.svelte.ts` modules — `$state` objects exported as singletons |
| Migration strategy | Big bang on `feat/svelte` branch |
| Web Component wrapper | Keep `ApiExplorerElement`, mount Svelte inside `connectedCallback` |
| Routing | Keep hash-based routing, wire up in `onMount` inside `App.svelte` |
| Resizable panes | Keep `resizable-panes.ts` as-is, call in `onMount` after mount |
| Syntax highlighting | Use `{@html}` for pre-highlighted output (Svelte escapes by default) |

---

## Phase 0 — Branch + tooling setup

**Goal**: Svelte compiles; `npm run dev` serves the app on old code.

### 0.1 Start from `main`

We are currently on `feat/preact` with partial Preact changes. Discard that branch and start clean:

```bash
git checkout main
git checkout -b feat/svelte
```

### 0.2 Install dependencies

```bash
npm install svelte
npm install --save-dev @sveltejs/vite-plugin-svelte
```

### 0.3 Update `vite.config.ts`

```ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({ mode }) => ({
  plugins: [tailwindcss(), svelte()],
  ...(mode === "lib" && {
    build: {
      lib: {
        entry: "src/loader.ts",
        name: "ApiExplorer",
        fileName: "loader",
        formats: ["iife"],
      },
      rollupOptions: {
        output: { entryFileNames: "[name].js" },
      },
    },
  }),
}));
```

### 0.4 Update `tsconfig.json`

Add Svelte's recommended compiler options and include `.svelte` files:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts", "src/**/*.svelte", "src/**/*.svelte.ts"],
  "exclude": ["node_modules", "dist"]
}
```

> **Note**: No `jsx`/`jsxImportSource` needed — Svelte uses its own compiler, not JSX.

### 0.5 Add `svelte.config.js` at project root

```js
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
};
```

### 0.6 Verify

```bash
npx tsc --noEmit   # must pass — no .svelte files exist yet
npm run dev        # app still loads on old code
```

---

## Phase 1 — Migrate state stores to Runes

**Goal**: Replace the custom pub-sub stores with `$state` objects in `.svelte.ts` modules. Same filenames, same directory — only internals change.

### Pattern

Svelte 5 allows `$state` in `.svelte.ts` files (renamed from `.ts`). Export a single reactive object per domain; components import it directly. Because the object is reactive, any component that reads a property will re-run when it changes.

```ts
// Before: state/nav-state.ts (pub-sub)
function createNavState() {
  let searchQuery = "";
  const subs = new Set<() => void>();
  return {
    get searchQuery() { return searchQuery; },
    setSearch(q: string) { searchQuery = q; subs.forEach(fn => fn()); },
    sub(fn: () => void) { subs.add(fn); return () => subs.delete(fn); },
  };
}
export const navState = createNavState();

// After: state/nav-state.svelte.ts (Runes)
import type { EndpointEntry } from "../types/openapi";

export const navState = $state({
  searchQuery: "",
  sidebarTab: "endpoints" as "endpoints" | "schemas",
  activeEndpoint: null as EndpointEntry | null,
  activeSchema: null as string | null,
});
```

Components read and write the object directly — no `.sub()`, no `notify()`, no getter functions:

```svelte
<!-- Nav.svelte -->
<script lang="ts">
  import { navState } from "../state/nav-state.svelte.ts";
</script>

<input bind:value={navState.searchQuery} />
```

### Store-by-store migration

| Old file | New file | Key `$state` fields |
|---|---|---|
| `state/spec-state.ts` | `state/spec-state.svelte.ts` | `spec`, `groups` |
| `state/nav-state.ts` | `state/nav-state.svelte.ts` | `searchQuery`, `sidebarTab`, `activeEndpoint`, `activeSchema` |
| `state/server-state.ts` | `state/server-state.svelte.ts` | `selectedServer`, `serverVariables`, `serverPopoverSource` |
| `state/auth-state.ts` | `state/auth-state.svelte.ts` | `authValues`, `authModalVisible` |
| `state/playground-state.ts` | `state/playground-state.svelte.ts` | `endpoint`, `paramValues`, `bodyValue`, `bodyParams`, `fileValues`, `loading`, `response` |
| `state/modal-state.ts` | `state/modal-state.svelte.ts` | `modalVisible`, `shortcutsVisible`, `modalUrlValue`, `modalError` |
| `state/actions.ts` | `state/actions.ts` (unchanged name) | Mutates the `$state` objects directly instead of calling `.load()` |

### `$derived` for computed values

Use `$derived` for values that depend on other state, replacing manual filtering in `app.ts`:

```ts
// state/nav-state.svelte.ts
import { specState } from "./spec-state.svelte.ts";

export const navState = $state({ searchQuery: "", ... });

export const filteredGroups = $derived(
  navState.searchQuery.trim()
    ? specState.groups.filter(/* search logic */)
    : specState.groups
);
```

### URL preview as `$derived`

The current `updateUrlPreview()` in `app.ts` becomes a derived value:

```ts
// state/playground-state.svelte.ts
import { $derived } from "svelte";
import { serverState } from "./server-state.svelte.ts";
import { buildUrl, resolveServerUrl } from "../parser/example-gen";

export const resolvedUrl = $derived.by(() => {
  if (!playgroundState.endpoint) return "";
  return buildUrl(
    resolveServerUrl(serverState.selectedServer, serverState.serverVariables),
    playgroundState.endpoint.path,
    playgroundState.paramValues,
    /* resolved params */
  );
});
```

### After Phase 1

TypeScript compiles. The old `app.ts` still references the old store API and will break — that's expected. Keep going.

---

## Phase 2 — Utility and parser files (no changes)

These are pure functions with no rendering or state. Leave them exactly as-is:

- `utils/html.ts` — `escapeHtml` / `escapeAttr` (will be used less — Svelte auto-escapes)
- `utils/badges.ts` — `methodBadgeClasses`
- `utils/highlight.ts` — JSON syntax highlighting (output rendered with `{@html}`)
- `utils/http-client.ts` — `executeRequest`
- `utils/resizable-panes.ts` — drag logic (called in `onMount`)
- `parser/spec-parser.ts`
- `parser/ref-resolver.ts`
- `parser/example-gen.ts`

---

## Phase 3 — Migrate leaf/shared components

**Goal**: Small, self-contained Svelte components with no children dependencies.

### 3.1 `components/schema-viewer.ts` → `components/SchemaViewer.svelte`

Convert the string-returning render function to a Svelte component. Props replace function parameters.

```svelte
<!-- SchemaViewer.svelte -->
<script lang="ts">
  import type { SchemaObject, ComponentsObject } from "../types/openapi";

  let { schema, components }: {
    schema: SchemaObject;
    components?: ComponentsObject;
  } = $props();
</script>

<div class="...">
  <!-- template replaces the HTML string -->
</div>
```

> **Key difference from old code**: No `escapeHtml` needed for text nodes — Svelte escapes by default.  
> Use `{@html highlightedOutput}` only for pre-highlighted JSON from `utils/highlight.ts`.

### 3.2 Conventions for all `.svelte` files

- Props declared with `let { ... } = $props()`
- Event handlers inline: `onclick={handler}` (Svelte 5 — not `on:click`)
- Two-way binding: `bind:value={state.field}` where appropriate
- Class toggling: `class:dark={isDark}` or ternary in `class={...}`
- Each block: `{#each items as item (item.id)}`
- Conditionals: `{#if condition}...{:else}...{/if}`

---

## Phase 4 — Migrate modal components

Each modal reads directly from the `$state` singletons — no prop drilling for state.

### 4.1 `components/load-modal.ts` → `components/LoadModal.svelte`

```svelte
<script lang="ts">
  import { modalState } from "../state/modal-state.svelte.ts";

  let { onLoadUrl, onLoadFile }: {
    onLoadUrl: (url: string) => Promise<void>;
    onLoadFile: (file: File) => Promise<void>;
  } = $props();
</script>

{#if modalState.modalVisible}
  <div class="fixed inset-0 ...">
    ...
  </div>
{/if}
```

### 4.2 `components/auth-modal.ts` → `components/AuthModal.svelte`

Reads `authState.authModalVisible`, `authState.authValues`. Writes back by mutating `authState` directly.

### 4.3 `components/server-config.ts` → `components/ServerConfig.svelte`

Reads/writes `serverState.serverVariables`, `serverState.selectedServer`.

---

## Phase 5 — Migrate navigation and top bar

### 5.1 `components/nav.ts` → `components/Nav.svelte`

- Reads `navState`, `specState`, `filteredGroups` (derived)
- Keyboard navigation (`navigateNav`) becomes a function called from `App.svelte`'s global `keydown` handler
- No `bindNavEvents` — event handlers are inline in the template

### 5.2 `components/top-bar.ts` → `components/TopBar.svelte`

- Reads `specState.spec`, `authState.authValues`, `serverState.*`
- Dark mode toggle stays local to this component (reads/writes `localStorage`)

---

## Phase 6 — Migrate page components

### 6.1 `pages/endpoint-detail.ts` → `pages/EndpointDetail.svelte`

- Reads `navState.activeEndpoint`, `specState.spec`
- `renderDetailEmpty()` becomes an `{#if}` block inside the component

### 6.2 `pages/schema-detail.ts` → `pages/SchemaDetail.svelte`

- Reads `navState.activeSchema`, `specState.spec`

### 6.3 Create `pages/DetailPane.svelte` (new)

Wraps both detail views — replaces the `if/else` logic currently in `renderDetailPane()` in `app.ts`:

```svelte
<!-- pages/DetailPane.svelte -->
<script lang="ts">
  import { navState } from "../state/nav-state.svelte.ts";
  import EndpointDetail from "./EndpointDetail.svelte";
  import SchemaDetail from "./SchemaDetail.svelte";
</script>

{#if navState.activeSchema}
  <SchemaDetail />
{:else if navState.activeEndpoint}
  <EndpointDetail />
{:else}
  <div class="h-full flex flex-col items-center justify-center ...">
    <!-- empty state -->
  </div>
{/if}
```

---

## Phase 7 — Migrate the playground

`components/playground.ts` → `components/Playground.svelte`

This is the most complex component.

- Reads `playgroundState.*`, `authState.authValues`, `serverState.*`
- `handleExecute` stays as a local async function inside `<script>`
- `resolvedUrl` comes from the `$derived` in `playground-state.svelte.ts`
- File inputs use `bind:files`

```svelte
<script lang="ts">
  import { playgroundState, resolvedUrl } from "../state/playground-state.svelte.ts";
  import { executeRequest, isCorsError } from "../utils/http-client";

  async function handleExecute() {
    playgroundState.loading = true;
    try {
      const response = await executeRequest(/* ... */);
      playgroundState.response = response;
    } catch (err) {
      playgroundState.response = { status: 0, statusText: String(err), ... };
    } finally {
      playgroundState.loading = false;
    }
  }
</script>
```

---

## Phase 8 — App shell and Web Component

### 8.1 Write `src/App.svelte`

Root Svelte component. Replaces all of `app.ts`. Owns: lifecycle, keyboard shortcuts, hash routing, dark mode.

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { initResizablePanes } from "./utils/resizable-panes";
  import Nav from "./components/Nav.svelte";
  import TopBar from "./components/TopBar.svelte";
  import Playground from "./components/Playground.svelte";
  import LoadModal from "./components/LoadModal.svelte";
  import AuthModal from "./components/AuthModal.svelte";
  import DetailPane from "./pages/DetailPane.svelte";
  import { navState } from "./state/nav-state.svelte.ts";
  import { modalState } from "./state/modal-state.svelte.ts";
  import { loadSpecFromUrl, loadSpecFromFile } from "./state/actions";

  let { root, initialUrl }: { root: HTMLElement; initialUrl?: string } = $props();

  onMount(() => {
    initResizablePanes(root);
    restoreFromHash();

    const onHashChange = () => restoreFromHash();
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("keydown", onKeyDown);

    if (initialUrl) loadSpecFromUrl(initialUrl);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  function onKeyDown(e: KeyboardEvent) { /* keyboard shortcuts */ }
  function restoreFromHash()           { /* hash routing logic */ }
</script>

<div class="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900"
     style="font-family:'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif">
  <LoadModal onLoadUrl={loadSpecFromUrl} onLoadFile={loadSpecFromFile} />
  <AuthModal />
  <TopBar />
  <div id="pane-container" class="flex flex-1 min-h-0 overflow-hidden">
    <Nav />
    <div class="pane-handle" aria-hidden="true"><div class="pane-handle-line"></div></div>
    <DetailPane />
    <div class="pane-handle" aria-hidden="true"><div class="pane-handle-line"></div></div>
    {#if navState.activeEndpoint}
      <Playground />
    {/if}
  </div>
</div>
```

### 8.2 Update `element.ts`

Replace `createApp()` with Svelte's `mount` / `unmount`:

```ts
import { mount, unmount } from "svelte";
import App from "./App.svelte";
import { loadSpecFromUrl } from "./state/actions";

export class ApiExplorerElement extends HTMLElement {
  static observedAttributes = ["url"];
  private _app: ReturnType<typeof mount> | null = null;

  connectedCallback() {
    if (!this.style.display) this.style.display = "block";
    if (!this.style.height)  this.style.height  = "100%";

    const url =
      this.getAttribute("url") ??
      new URLSearchParams(location.search).get("url") ??
      undefined;

    this._app = mount(App, {
      target: this,
      props: { root: this, initialUrl: url },
    });
  }

  disconnectedCallback() {
    if (this._app) unmount(this._app);
    this._app = null;
  }

  attributeChangedCallback(name: string, _old: string | null, newValue: string | null) {
    if (name === "url" && newValue && this.isConnected) loadSpecFromUrl(newValue);
  }
}
```

### 8.3 Delete `app.ts`

All logic from `app.ts` is now distributed across: `App.svelte` (lifecycle/keyboard/routing), state modules (state), and individual components (events/rendering).

---

## Phase 9 — Cleanup

- Delete all old `render*` + `bind*Events` `.ts` component files (replaced by `.svelte`)
- Remove `escapeHtml` / `escapeAttr` usage from components (Svelte auto-escapes)
- Keep `utils/html.ts` only if needed for `{@html}` content preparation
- Update `CLAUDE.md`:
  - Rendering: Svelte components (`.svelte`), not `render*` string functions
  - State: Runes in `.svelte.ts` modules, not pub-sub stores
  - Event handling: inline `onclick={handler}` (Svelte 5), not `bind*Events`
  - File naming: `.svelte` for components, `.svelte.ts` for state modules

---

## Phase 10 — Build and QA

```bash
npx tsc --noEmit        # zero errors
npm run dev             # visual smoke test
npm run build           # production build
npm run build:lib       # IIFE bundle for embedding
```

Manual smoke test checklist:
- [ ] Load spec from URL
- [ ] Load spec from file (JSON + YAML)
- [ ] Nav search filters endpoints
- [ ] Click endpoint → detail pane updates, URL hash changes
- [ ] Click schema → schema detail renders
- [ ] Try-it: fill path/query params, execute, see response
- [ ] Try-it: file upload param works
- [ ] Auth modal opens, saves values, closes
- [ ] Server config modal opens, changes URL
- [ ] Dark mode toggle persists across reload
- [ ] Keyboard shortcuts: `/` focuses search, `↑↓` navigates, `⌘K` opens load modal, `⌘↵` executes, `?` toggles shortcuts, `Esc` closes
- [ ] Hash routing: navigate to `#endpoints/<id>` directly
- [ ] Resizable panes drag correctly
- [ ] `<api-explorer url="...">` attribute works from HTML
- [ ] `attributeChangedCallback` reloads spec on `url` attribute change

---

## File map

### Renamed / rewritten

| Old | New |
|---|---|
| `src/app.ts` | `src/App.svelte` |
| `src/components/nav.ts` | `src/components/Nav.svelte` |
| `src/components/top-bar.ts` | `src/components/TopBar.svelte` |
| `src/components/playground.ts` | `src/components/Playground.svelte` |
| `src/components/auth-modal.ts` | `src/components/AuthModal.svelte` |
| `src/components/load-modal.ts` | `src/components/LoadModal.svelte` |
| `src/components/server-config.ts` | `src/components/ServerConfig.svelte` |
| `src/components/schema-viewer.ts` | `src/components/SchemaViewer.svelte` |
| `src/pages/endpoint-detail.ts` | `src/pages/EndpointDetail.svelte` |
| `src/pages/schema-detail.ts` | `src/pages/SchemaDetail.svelte` |
| `src/state/spec-state.ts` | `src/state/spec-state.svelte.ts` |
| `src/state/nav-state.ts` | `src/state/nav-state.svelte.ts` |
| `src/state/server-state.ts` | `src/state/server-state.svelte.ts` |
| `src/state/auth-state.ts` | `src/state/auth-state.svelte.ts` |
| `src/state/playground-state.ts` | `src/state/playground-state.svelte.ts` |
| `src/state/modal-state.ts` | `src/state/modal-state.svelte.ts` |

### New files

| File | Purpose |
|---|---|
| `src/pages/DetailPane.svelte` | Wraps EndpointDetail / SchemaDetail / empty state |
| `svelte.config.js` | Svelte compiler config |

### Unchanged

| File | Reason |
|---|---|
| `src/element.ts` | Updated in place (mount/unmount swap) |
| `src/state/actions.ts` | Updated in place (writes to `$state` objects) |
| `src/utils/*.ts` | Pure functions — no changes |
| `src/parser/*.ts` | Pure functions — no changes |
| `src/types/openapi.ts` | Types — no changes |
| `src/loader.ts` | Entry point — no changes |
| `src/main.ts` | Dev entry — no changes |
| `src/style.css` | Global styles — no changes |

---

## Rough effort estimate

| Phase | Work |
|---|---|
| 0 — Tooling | ~30 min |
| 1 — Runes state | ~2 h |
| 2 — Utils | 0 (no-op) |
| 3 — SchemaViewer | ~45 min |
| 4 — Modals (3×) | ~2 h |
| 5 — Nav + TopBar | ~2 h |
| 6 — Pages + DetailPane | ~1.5 h |
| 7 — Playground | ~3 h (most complex) |
| 8 — App + element.ts | ~2 h |
| 9 — Cleanup + CLAUDE.md | ~45 min |
| 10 — QA | ~1 h |
| **Total** | **~15 h** |