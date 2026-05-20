/** Compact dropdown with checkboxes for array parameters with a fixed enum set. */
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";

const triggerBase =
  "w-full text-xs border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 " +
  "text-gray-800 dark:text-gray-200 " +
  "focus:outline-none focus:ring-1 transition-colors font-mono " +
  "flex items-center justify-between text-left";

interface Props {
  value: string;
  options: unknown[];
  invalid?: boolean;
  onChange: (value: string) => void;
}

/**
 * Renders a button that opens a dropdown of checkboxes, one per enum option.
 * Selected values are stored as a comma-separated string to match paramValues shape.
 */
export default function MultiSelect({ value, options, invalid, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? value.split(",").filter(Boolean) : [];

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter(v => v !== opt)
      : [...selected, opt];
    onChange(next.join(","));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={clsx(triggerBase, invalid
          ? "border-red-400 dark:border-red-500 focus:ring-red-400 focus:border-red-400"
          : "border-gray-200 dark:border-gray-600 focus:ring-blue-400 focus:border-blue-400")}
        onClick={() => setOpen(o => !o)}
      >
        <span className={selected.length ? "" : "text-gray-300 dark:text-gray-500"}>
          {selected.length ? selected.join(", ") : "—"}
        </span>
        <svg className={clsx("w-3 h-3 text-gray-400 shrink-0 transition-transform", open && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg py-1">
          {options.map(opt => {
            const s = String(opt);
            const checked = selected.includes(s);
            return (
              <label key={s} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(s)}
                  className="rounded text-blue-500 border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{s}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}