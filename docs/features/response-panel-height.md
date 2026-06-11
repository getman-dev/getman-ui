# Fix: Response Panel — Vertical Drag Handle

**Priority:** P2 — polish  
**Branch:** `fix/response-panel-height`  
**Files touched:**
- `src/shared/components/VerticalResizable.tsx` ← new file
- `src/features/playground/Playground.tsx`
- `src/features/playground/ResponsePanel.tsx`

`resizable-panes.ts`, `App.tsx`, and `style.css` are **not touched** — the vertical split is handled
entirely by a React component, not by the vanilla-JS pane system.

---

## Problem

`ResponsePanel` renders with `style={{ height: 280 }}` (hardcoded). Long JSON responses require
excessive scrolling inside a tiny window. There is no way for the user to resize the split between
the request form and the response panel.

---

## Goal

A reusable `VerticalResizable` React component that:

- Renders two children separated by a draggable horizontal handle.
- Controls the bottom child's height via local React state.
- Persists the chosen height to `localStorage` under a caller-supplied key, so it survives page reloads.
- Is generic enough to be dropped into any vertical flex layout that needs a resizable split.

---

## New component: `VerticalResizable`

### File

`src/shared/components/VerticalResizable.tsx`

### Props

```tsx
interface VerticalResizableProps {
  /** localStorage key — must be unique per usage site. */
  storageKey: string;
  /** Default height of the bottom pane in px, used when nothing is stored yet. */
  defaultBottomHeight: number;
  /** Minimum height of the top pane in px. Default: 80. */
  minTop?: number;
  /** Minimum height of the bottom pane in px. Default: 80. */
  minBottom?: number;
  top: React.ReactNode;
  bottom: React.ReactNode;
}
```

### Rendered structure

```
┌──────────────────────────────┐  ← flex-1 min-h-0 flex flex-col overflow-hidden
│  top (flex-1 min-h-0         │
│       overflow-y-auto)       │
│                              │
├──────────────────────────────┤  ← drag handle  (h-2, cursor-row-resize)
│  bottom (shrink-0,           │
│          height: Npx)        │
└──────────────────────────────┘
```

### State and storage

```tsx
// Initialise from localStorage; fall back to defaultBottomHeight.
const [bottomHeight, setBottomHeight] = useState<number>(() => {
  try {
    const stored = localStorage.getItem(storageKey);
    const h = Number(stored);
    if (isFinite(h) && h > 0) return h;
  } catch { /* ignore */ }
  return defaultBottomHeight;
});

// Keep a ref so drag callbacks always read the live value without stale closures.
const heightRef = useRef(bottomHeight);
```

### Drag logic

```tsx
function handleMouseDown(e: React.MouseEvent) {
  e.preventDefault();
  const startY      = e.clientY;
  const startHeight = heightRef.current;
  const containerH  = containerRef.current?.getBoundingClientRect().height ?? 0;

  document.body.style.cursor     = "row-resize";
  document.body.style.userSelect = "none";

  function onMove(ev: MouseEvent) {
    // Drag up → larger bottom pane; drag down → smaller.
    const next = Math.max(
      effectiveMinBottom,
      Math.min(startHeight + (startY - ev.clientY), containerH - effectiveMinTop - HANDLE_H),
    );
    heightRef.current = next;
    setBottomHeight(next);
  }

  function onUp() {
    document.body.style.cursor     = "";
    document.body.style.userSelect = "";
    try { localStorage.setItem(storageKey, String(heightRef.current)); } catch { /* ignore */ }
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup",  onUp);
  }

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup",  onUp);
}
```

`HANDLE_H = 8` (the `h-2` handle div).  
`effectiveMinTop` / `effectiveMinBottom` default to `80` when the caller omits `minTop` / `minBottom`.

### Handle markup

```tsx
<div
  className="shrink-0 h-2 cursor-row-resize flex items-center justify-center group"
  onMouseDown={handleMouseDown}
  aria-hidden="true"
>
  <div className="w-8 h-0.5 rounded-full bg-gray-200 dark:bg-gray-600
                  group-hover:bg-blue-400 dark:group-hover:bg-blue-500 transition-colors" />
</div>
```

No new CSS needed — Tailwind covers cursor, sizing, and hover colour.

---

## Usage in `Playground.tsx`

Replace the standalone form scroll div + `<ResponsePanel>` with `<VerticalResizable>`:

```tsx
// Before:
<div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 flex flex-col gap-7">
  {/* ...form content... */}
</div>
<ResponsePanel loading={loading} response={response} />

// After:
<VerticalResizable
  storageKey="try-pane-split"
  defaultBottomHeight={280}
  minTop={120}
  minBottom={80}
  top={
    <div className="px-5 py-6 flex flex-col gap-7">
      {/* ...unchanged form content... */}
    </div>
  }
  bottom={<ResponsePanel loading={loading} response={response} />}
/>
```

`VerticalResizable` owns the `flex-1 min-h-0 overflow-y-auto` wrapper for the top slot internally,
so those classes are removed from the form div.

---

## Changes to `ResponsePanel.tsx`

**Revert the interim Option 2 change** applied earlier in this branch:

- Line 61 outer wrapper: restore `shrink-0`, remove `max-h-[60vh] overflow-hidden`.
- Line 113 content div: restore `flex-1`.

`VerticalResizable` sets an explicit `height: Npx` on the bottom slot's wrapper, so the inner
`flex-1 overflow-auto` works correctly again — the parent has a defined pixel height.

No other changes to `ResponsePanel.tsx`.

---

## Reusability

`VerticalResizable` accepts `storageKey` as a prop, so it can be dropped into any other vertical
split in the app without change. Example future use:

```tsx
<VerticalResizable
  storageKey="schema-detail-split"
  defaultBottomHeight={200}
  top={<SchemaNode />}
  bottom={<SchemaExamples />}
/>
```

---

## Acceptance Criteria

- [ ] Dragging the handle up/down resizes the response panel; the form area takes the remainder.
- [ ] Height is written to `localStorage["try-pane-split"]` on `mouseup` and read back on next load.
- [ ] Default height (no stored value) is 280 px — matching the old hardcoded value exactly.
- [ ] Response panel cannot shrink below 80 px.
- [ ] Form area cannot shrink below 120 px.
- [ ] Handle hover shows a blue tint on the grip line (Tailwind `group-hover:bg-blue-400`).
- [ ] `document.body` cursor is `row-resize` during drag and restored to `""` on `mouseup`.
- [ ] Loading spinner and empty-state placeholder inside `ResponsePanel` are visually unchanged.
- [ ] No regression in horizontal pane resize (`#handle-left`, `#handle-right`).
- [ ] `VerticalResizable` has no knowledge of playground domain — only `top`, `bottom`, sizing props, and `storageKey`.

---

## Out of Scope

- Touch / pointer-event support for mobile drag.
- Keyboard arrow-key resizing of the vertical handle.
- Animating the panel open when the first response arrives.
- A collapse-to-zero toggle button on the response panel.