const STORAGE_KEY = "pane-widths-v1";
const HANDLE_TOTAL_PX = 8; // 2 handles × 4px each
const MIN_NAV = 12;    // minimum % for nav pane
const MIN_TRYIT = 12;  // minimum % for try-it pane
const MIN_DETAIL = 20; // % always reserved for center pane

interface StoredWidths {
  nav: number;
  playground: number;
}

const DEFAULTS: StoredWidths = { nav: 25, playground: 25 };

function load(): StoredWidths {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<StoredWidths>;
      return {
        nav: typeof p.nav === "number" ? p.nav : DEFAULTS.nav,
        playground: typeof p.playground === "number" ? p.playground : DEFAULTS.playground,
      };
    }
  } catch { /* ignore corrupt storage */ }
  return { ...DEFAULTS };
}

function persist(w: StoredWidths): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(w)); } catch { /* ignore */ }
}

export function initResizablePanes(root: HTMLElement = document.documentElement): void {
  const container = root.querySelector<HTMLElement>("#pane-container");
  const nav = root.querySelector<HTMLElement>("#nav-pane");
  const tryIt = root.querySelector<HTMLElement>("#try-pane");
  const leftHandle = root.querySelector<HTMLElement>("#handle-left");
  const rightHandle = root.querySelector<HTMLElement>("#handle-right");

  if (!container || !nav || !tryIt || !leftHandle || !rightHandle) return;

  const containerEl = container as HTMLElement;
  const navEl = nav as HTMLElement;
  const tryItEl = tryIt as HTMLElement;

  const state = load();

  function usableWidth(): number {
    return containerEl.getBoundingClientRect().width - HANDLE_TOTAL_PX;
  }

  function applyWidths(): void {
    const W = usableWidth();
    navEl.style.width = `${Math.round(W * state.nav / 100)}px`;
    tryItEl.style.width = `${Math.round(W * state.playground / 100)}px`;
  }

  applyWidths();

  function makeDraggable(handle: HTMLElement, side: "left" | "right"): void {
    handle.addEventListener("mousedown", (e: MouseEvent) => {
      e.preventDefault();

      const startX = e.clientX;
      const startState = { ...state };
      const W = usableWidth();

      handle.classList.add("dragging");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      function onMove(e: MouseEvent): void {
        const deltaPct = ((e.clientX - startX) / W) * 100;

        if (side === "left") {
          // Left handle: drag right expands nav, shrinks detail
          state.nav = Math.max(
            MIN_NAV,
            Math.min(startState.nav + deltaPct, 100 - MIN_DETAIL - state.playground)
          );
        } else {
          // Right handle: drag right shrinks tryIt, expands detail
          state.playground = Math.max(
            MIN_TRYIT,
            Math.min(startState.playground - deltaPct, 100 - MIN_DETAIL - state.nav)
          );
        }

        applyWidths();
      }

      function onUp(): void {
        handle.classList.remove("dragging");
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        persist(state);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }

  makeDraggable(leftHandle, "left");
  makeDraggable(rightHandle, "right");

  window.addEventListener("resize", applyWidths);
}