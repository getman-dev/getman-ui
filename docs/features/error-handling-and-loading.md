# Feature Spec: Error Handling and Loading States

## Goal

Make the API Explorer fail visibly rather than silently. When a spec fails to load, when the app crashes mid-render, or
when a fetch is in progress, users and embedders must see explicit UI feedback — not a blank div.

## Background

Three independent gaps exist in the current error and loading story, all identified in the beta-launch spec:

**1. Silent spec load failure (P0 bug)**
`loadSpecFromUrl` in `shared/state/actions.ts:29` calls `modalActions.setModalError(...)` on failure. But the
`LoadModal` only renders this error when `modalVisible` is `true` — and during a programmatic embed (
`mountApiExplorer(el, { url })`) the modal is never opened. The error is stored in context and then never displayed. The
user sees a permanently empty UI with no explanation.

**2. Missing loading state (P0 UX)**
When `initialUrl` is passed, the app renders a fully empty nav and detail pane for the entire duration of the fetch.
`spec-context.tsx` has no `specLoading` field; `loadSpecFromUrl` sets no loading state before the `fetch`. On a slow
network this is a multi-second blank screen indistinguishable from "nothing is configured."

**3. No React error boundary (P1 reliability)**
No `ErrorBoundary` exists anywhere in the component tree. A thrown exception in any component — e.g., a `$ref` cycle, an
unexpected spec shape reaching a renderer, a JS runtime error — unmounts the entire embedded UI with no message. In an
embedded context the browser console is not visible to end users.

**Bonus: Silent schema depth truncation (P2 polish)**
`SchemaNode.tsx:40` silently returns `null` at `depth > 5`. Deep schemas are cut off with no visual indication.

---

## Problem 1 — Spec Load Failure

### Two entry points — one broken, one already works

`loadSpecFromUrl` is called from two places with different modal state:

**Entry point 1 — Programmatic embed (broken)**
```
mountApiExplorer(el, { url: "https://example.com/bad.json" })
  → AppInner.useEffect → loadSpecFromUrl(url)
  → fetch fails → catch → modalActions.setModalError("Failed to load: HTTP 404")
  → modalError is set, but modalVisible = false (modal was never opened)
  → LoadModal renders modalError only when modalVisible = true  ← error is invisible
  → user sees a blank div with no explanation
```

**Entry point 2 — Load modal URL / file (already works)**
```
User opens LoadModal, pastes URL, clicks Load
  → LoadModal.loadUrl() → loadSpecFromUrl(url)
  → fetch fails → catch → modalActions.setModalError("Failed to load: HTTP 404")
  → modalError is set AND modalVisible = true (modal is still open)
  → LoadModal.tsx:88-92 renders the error inline inside the modal  ← error is visible
```

`LoadModal` also handles file upload errors via `loadSpecFromFile`, which writes the same `modalError`. The file path works for the same reason: the modal is open throughout.

The fix only needs to address entry point 1. Entry point 2 is correct as-is.

### Approach A — Inline error banner in `AppInner` (reuse `modalError`)

Add a banner inside `AppInner` that reads `modalError` from `useModal()` and renders when
`!modalVisible && !!modalError`. This condition precisely identifies the broken path: there is an
error but no modal open to display it.

```
┌─────────────────────────────────────────────────────────────┐
│  TopBar                                                     │
├──────────┬──────────────────────────────────────────────────┤
│          │  ⚠ Failed to load spec: HTTP 404 Not Found  [×] │
│  Nav     │                                                  │
│  (empty) │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

No new state needed — `modalError` is already set by `loadSpecFromUrl` and cleared by `applySpec` on success.

```tsx
// AppInner — between <TopBar /> and #pane-container
{modalError && !modalVisible && (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
        <span className="shrink-0">⚠</span>
        <span className="flex-1">{modalError}</span>
        <button onClick={() => modalActions.setModalError("")} className="shrink-0 text-red-400 hover:text-red-600">×</button>
    </div>
)}
```

**Pros:** Zero new state, no context changes, no changes to `LoadModal`. The condition `!modalVisible && !!modalError`
maps exactly to the broken entry point.
**Cons:** `modalError` is semantically "modal error" — the field name doesn't communicate its dual use. The banner
disappears if the user opens the load modal after a failed embed load (because `modalVisible` flips to `true`), which is
acceptable behaviour but non-obvious.

### Approach B — Dedicated `embedError` in spec-context

Add `embedError: string` and `setEmbedError` to `spec-context.tsx`. `loadSpecFromUrl` writes to `embedError` on
failure. `AppInner` reads `useSpec().embedError` for the banner. `LoadModal` continues to read `modalError` unchanged.

```ts
// spec-context.tsx
interface SpecState {
    spec: OpenAPISpec | null;
    groups: TagGroup[];
    specLoading: boolean;
    embedError: string;          // ← new: only set by programmatic loads
}
```

```ts
// actions.ts — loadSpecFromUrl catch block
specActions.setEmbedError(`Failed to load: ${err instanceof Error ? err.message : String(err)}`);
// Note: do NOT call modalActions.setModalError here — LoadModal already handles its own errors
// via the modal-visible path. Calling both would double-write on modal-driven failures.
```

This means `loadSpecFromUrl` would set `embedError` only, and `LoadModal.loadUrl()` would need its
own error handling to also set `modalError`, or `loadSpecFromUrl` needs a parameter to control which
sink to write to.

**Pros:** Fully separated concerns — embed errors and modal errors are distinct state, named unambiguously.
**Cons:** Splitting the two entry points requires either (a) a `source` parameter on `loadSpecFromUrl`, or (b)
`LoadModal` wrapping `loadSpecFromUrl` in its own try/catch and setting `modalError` itself. Either way touches more
files than Approach A for the same user-visible outcome.

### Recommendation: Approach A

Approach A is the minimum correct fix. The condition `!modalVisible && !!modalError` is accurate: it fires exactly when
there is an error the modal is not displaying. Approach B's cleaner semantics come at the cost of restructuring how
errors flow from `loadSpecFromUrl` to its two callers — warranted if this becomes a maintenance pain point, not now.

---

## Problem 2 — React Error Boundary

### Current behaviour

Any uncaught exception during React rendering — including errors in `SchemaNode` traversal, unexpected spec shapes, or
JS runtime errors — propagates to the root and unmounts the entire app. In an embedded context there is no error UI.

### Approach A — Wrap the pane container

`ErrorBoundary` wraps `#pane-container` in `AppInner`. Contexts (`AppProviders`) remain outside the boundary so they are
always available, even in the fallback.

```tsx
// src/shared/components/ErrorBoundary.tsx (new file)
import {Component, type ReactNode, type ErrorInfo} from "react";

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

/** Catches render errors in its subtree and shows a recovery UI instead of a blank page. */
export class ErrorBoundary extends Component<Props, State> {
    state: State = {error: null};

    static getDerivedStateFromError(error: Error): State {
        return {error};
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ApiExplorer] Render error:", error, info.componentStack);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Something went wrong</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{this.state.error.message}</p>
                    <button
                        onClick={() => this.setState({error: null})}
                        className="px-3 py-1.5 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                    >
                        Try to recover
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
```

```tsx
// App.tsx — AppInner, wrap pane-container
<ErrorBoundary>
    <div id="pane-container" className="flex flex-1 min-h-0 overflow-hidden">
        {/* ...existing three-pane layout... */}
    </div>
</ErrorBoundary>
```

**Pros:** Minimal footprint — one new file, one JSX wrapper. Contexts survive the boundary. The "Try to recover" button
resets the boundary state, which triggers a re-render of the subtree (useful if the error was transient).
**Cons:** `TopBar` and `Nav` modals remain visible even when the content area is in error state — this is fine, since
users can still open the load modal to try a different spec.

### Approach B — Wrap the entire `AppInner`

Wrap `AppInner` instead of just `#pane-container`. This also catches errors in `TopBar`, `Nav`, modals, and keyboard
handlers.

**Pros:** More comprehensive coverage.
**Cons:** `AppProviders` is still outside, but all UI disappears on error. The fallback has no `TopBar` and no way to
re-load a spec. Worse recovery UX.

### Recommendation: Approach A

Wrap only the pane container. `TopBar` and `Nav` are stable and rarely the source of spec-related render errors. Keeping
them outside the boundary preserves the user's ability to re-load a different spec after a crash.


---

## Work items

### Phase 1 — Silent failure (Approach A for Problem 1)

1. **`src/App.tsx`** — Add inline error banner in `AppInner` below `<TopBar />`, above `#pane-container`. Condition:
   `modalError && !modalVisible`. Include a dismiss button that calls `modalActions.setModalError("")`.

### Phase 2 — Error boundary

6. **New `src/shared/components/ErrorBoundary.tsx`** — Class component as shown above. Exports `ErrorBoundary`.
7. **`src/App.tsx`** — Import `ErrorBoundary`, wrap the `#pane-container` div.

---

## Acceptance criteria

- [ ] `mountApiExplorer(el, { url: "https://example.com/bad.json" })` renders a visible error banner inside `el`, not a
  blank div.
- [ ] The error banner can be dismissed.
- [ ] `mountApiExplorer(el, { url: "https://example.com/openapi.json" })` shows a centered spinner in the nav and detail
  panes during the fetch, then the spec.
- [ ] Throwing an error inside `SchemaNode` or `EndpointDetail` renders the error boundary fallback with a "Try to
  recover" button, not a blank page.
- [ ] Clicking "Try to recover" dismisses the fallback and re-renders the subtree.
- [ ] `npm run typecheck` passes with no errors after all changes.