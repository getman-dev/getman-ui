# Feature Spec: Beta Launch

## Goal

Ship a stable, embeddable IIFE that can be dropped into existing projects via a script tag and pointed at a real API
spec URL. Self-hosted on a custom server.

## Constraints

- Embed model: `launch(el, { url })` or `data-api-explorer="<url>"` attribute auto-mount.
- Spec delivery: URL passed at mount time (no file-upload UX required for embedders).
- Must-haves: endpoint docs, playground, IIFE build.
- Auth and schema improvements are not beta blockers.

---

## Work items (priority order)

---

### 1. Fix: silent failure when `initialUrl` load fails

**Priority: P0 — bug**

When `launch(el, { url: "..." })` is called and the fetch fails (404, network error, CORS-blocked),
`loadSpecFromUrl` calls `modalActions.setModalError(...)` but the LoadModal is closed (default state). The error is
stored but never displayed — the user sees a permanently empty UI with no explanation.

**Fix:** Add a top-level inline error banner to `AppInner` that reads `modalError` from context and renders when
`!modalVisible && !!modalError`. This banner appears in the main content area (not in a modal) and is appropriate for
programmatic embed.

```
┌─────────────────────────────────────────────────────────┐
│  TopBar                                                 │
├──────────┬──────────────────────────────────────────────┤
│          │  ⚠ Failed to load spec: HTTP 404 Not Found   │
│  Nav     │                                              │
│  (empty) │                                              │
└──────────┴──────────────────────────────────────────────┘
```

**Files:** `src/App.tsx` (add banner in `AppInner`), `src/shared/contexts/modal-context.tsx` (verify `modalError` is
already in snapshot — it is).

---

### 2. Add: loading state during initial spec fetch

**Priority: P0 — UX regression for embeds**

When `initialUrl` is passed, the app renders a fully empty nav + empty detail pane for the duration of the fetch (no
skeleton, no spinner). Depending on network latency this is a multi-second blank screen.

**Fix:** Add a `specLoading` boolean to `spec-context` (default `false`). `loadSpecFromUrl` sets it `true` before fetch
and `false` in a `finally`. `Nav` and `DetailPane` read this flag and render a centered spinner instead of their normal
empty states.

Loading state only fires on the initial programmatic fetch, not on modal-driven loads (where the modal itself provides
visual feedback).

**Files:** `src/features/spec/spec-context.tsx`, `src/shared/state/actions.ts`, `src/features/nav/Nav.tsx`,
`src/features/nav/DetailPane.tsx`.

---

### 3. Add: React error boundary

**Priority: P1 — reliability**

No `ErrorBoundary` exists anywhere. A thrown exception in any component (e.g., a circular `$ref`, an unexpected spec
shape) blanks the entire embedded UI with no message. Since the UI is embedded in a customer app, the browser console is
typically not visible to end users.

**Fix:** Add a minimal `ErrorBoundary` class component in `src/shared/components/ErrorBoundary.tsx`. Wrap `AppInner`'s
main content area (not `AppProviders`, so context is still available). On error, render a fallback banner with the error
message and a "Reload" button that resets the boundary.

```tsx
<ErrorBoundary>
    <div id="pane-container">…</div>
</ErrorBoundary>
```

**Files:** New `src/shared/components/ErrorBoundary.tsx`, `src/App.tsx`.

---

### 4. Add: README with embedding guide

**Priority: P1 — required for actual adoption**

There is no `README.md`. This is the primary documentation consumers will read. It must cover the two supported embed
patterns.

**Contents:**

#### Script-tag embed (auto-mount)

```html

<div data-api-explorer="https://api.example.com/openapi.json" style="height:100vh"></div>
<script src="https://your-host.com/loader.js"></script>
```

#### Programmatic embed

```html

<div id="api-docs" style="height:100vh"></div>
<script src="https://your-host.com/loader.js"></script>
<script>
    ApiExplorer.launch(
            document.getElementById('api-docs'),
            {url: 'https://api.example.com/openapi.json'}
    );
</script>
```

> The IIFE exposes `window.ApiExplorer.launch`. The `name` in `vite.config.ts` is `"ApiExplorer"` — document
> this explicitly. Do not suggest ESM imports; the lib build is IIFE-only.

#### Required container CSS

The container element **must** have an explicit height (e.g., `height: 100vh` or `height: 600px`). The explorer fills
its container via `h-full`. Without it, the UI collapses to zero height.

#### Building and self-hosting

```bash
npm install
npm run build:lib      # produces dist/loader.js
# Serve dist/loader.js from your static server or CDN
```

For the standalone app (no embedding, direct navigation):

```bash
npm run build          # produces dist/ static site
# Serve the dist/ folder from any static file server
```

**File:** New `README.md` at project root.

---

### 5. Add: CI/CD — build and deploy on push

**Priority: P1 — required for self-hosted beta**

No GitHub Actions workflows exist. For a self-hosted deploy, define two workflows:

#### `ci.yml` — runs on every PR

- `npm ci`
- `npm run typecheck`
- `npm run build:lib`

#### `deploy.yml` — runs on push to `main`

- Build both `npm run build` (standalone app) and `npm run build:lib` (IIFE)
- Upload `dist/` to the self-hosted server via `rsync` / `scp` / provider-specific action

The deploy target (server address, SSH key, deploy path) is stored as GitHub repository secrets. The spec should include
a placeholder workflow that the user fills in with their server details.

**Files:** New `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`.

---

### 6. Fix: response panel fixed height

**Priority: P2 — polish**

`ResponsePanel` has a hardcoded `style={{ height: 280 }}`. Long JSON responses require excessive scrolling within a tiny
window. The playground pane already has resizable sides but not a resizable response split.

**Fix:** Replace the fixed height with a `min-h-[200px]` flex-grow approach, or extend `initResizablePanes` to include a
vertical drag handle between the request form and the response panel inside the try-pane.

Simpler interim fix: increase default height to `360px` and add `max-h-[60vh]` so it doesn't overflow on short screens.

**Files:** `src/features/playground/ResponsePanel.tsx`.

---

### 7. Fix: silent schema depth truncation

**Priority: P2 — polish**

`SchemaNode` silently stops rendering at `depth > 5` (`src/features/schema/SchemaNode.tsx:40`). Deep schemas are
truncated with no visual indication, which can confuse users looking for nested properties.

**Fix:** At the cutoff depth, render a muted `…` row indicating truncation rather than returning `null`.

```
└── metadata   object
    └── …  (max depth reached)
```

**Files:** `src/features/schema/SchemaNode.tsx`.

---

## Acceptance criteria

- [ ] Embedding `loader.js` with a bad spec URL shows a visible error message in the mounted element (not a blank div).
- [ ] Embedding with a valid spec URL shows a loading indicator during fetch, then the spec.
- [ ] A runtime exception in a nested component shows an error banner with a reload option, not a blank page.
- [ ] README explains both embed patterns, the required container height, and the build steps.
- [ ] `npm run typecheck` passes with no errors after all changes.
- [ ] CI workflow runs successfully on a test PR.
- [ ] The deploy workflow pushes a fresh `dist/` to the self-hosted server on merge to `main`.