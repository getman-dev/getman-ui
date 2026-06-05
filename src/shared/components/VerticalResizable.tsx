/** Generic two-pane vertical splitter with a draggable handle and localStorage persistence. */
import { useState, useRef } from "react";
import type React from "react";

const HANDLE_H = 8;

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

/** Renders two children separated by a draggable horizontal handle, with bottom pane height persisted to localStorage. */
export default function VerticalResizable({
  storageKey,
  defaultBottomHeight,
  minTop = 80,
  minBottom = 80,
  top,
  bottom,
}: VerticalResizableProps) {
  const [bottomHeight, setBottomHeight] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const h = Number(stored);
      if (isFinite(h) && h > 0) return h;
    } catch { /* ignore */ }
    return defaultBottomHeight;
  });

  const heightRef = useRef(bottomHeight);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const startY      = e.clientY;
    const startHeight = heightRef.current;
    const containerH  = containerRef.current?.getBoundingClientRect().height ?? 0;

    document.body.style.cursor     = "row-resize";
    document.body.style.userSelect = "none";

    function onMove(ev: MouseEvent) {
      const next = Math.max(
        minBottom,
        Math.min(startHeight + (startY - ev.clientY), containerH - minTop - HANDLE_H),
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

  return (
    <div ref={containerRef} className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {top}
      </div>
      <div
        className="shrink-0 h-2 cursor-row-resize flex items-center justify-center group"
        onMouseDown={handleMouseDown}
        aria-hidden="true"
      >
        <div className="w-8 h-0.5 rounded-full bg-gray-200 dark:bg-gray-600 group-hover:bg-blue-400 dark:group-hover:bg-blue-500 transition-colors" />
      </div>
      <div className="shrink-0 overflow-hidden" style={{ height: bottomHeight }}>
        {bottom}
      </div>
    </div>
  );
}