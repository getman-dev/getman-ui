/** Compact dropdown with checkboxes for array parameters with a fixed enum set. */
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import type { ThemeSlot } from "../../../themes/slot";
import { slot } from "../../../themes/slot";
import type { ThemeMode } from "../../../themes/types";
import { useThemeMode } from "../../../shared/contexts/theme-mode-context";

export interface MultiSelectTheme {
  trigger:        ThemeSlot;
  triggerInvalid: ThemeSlot;
  placeholder:    ThemeSlot;
  dropdown:       ThemeSlot;
  dropdownItem:   ThemeSlot;
  optionText:     ThemeSlot;
}

export const multiSelectTheme: Record<ThemeMode, MultiSelectTheme> = {
  default: {
    trigger:        'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono flex items-center justify-between text-left',
    triggerInvalid: 'w-full text-xs border border-red-400 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono flex items-center justify-between text-left',
    placeholder:    'text-gray-300',
    dropdown:       'absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg py-1',
    dropdownItem:   'flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer',
    optionText:     'text-xs font-mono text-gray-700',
  },
  dark: {
    trigger:        'w-full text-xs border border-gray-600 rounded-lg px-3 py-2 bg-gray-800 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono flex items-center justify-between text-left',
    triggerInvalid: 'w-full text-xs border border-red-500 rounded-lg px-3 py-2 bg-gray-800 text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono flex items-center justify-between text-left',
    placeholder:    'text-gray-500',
    dropdown:       'absolute z-20 mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 shadow-lg py-1',
    dropdownItem:   'flex items-center gap-2 px-3 py-1.5 hover:bg-gray-700/60 cursor-pointer',
    optionText:     'text-xs font-mono text-gray-300',
  },
};

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
  const t = multiSelectTheme[useThemeMode()];
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
        className={invalid ? slot(t.triggerInvalid) : slot(t.trigger)}
        onClick={() => setOpen(o => !o)}
      >
        <span className={selected.length ? "" : slot(t.placeholder)}>
          {selected.length ? selected.join(", ") : "—"}
        </span>
        <svg className={clsx("w-3 h-3 text-gray-400 shrink-0 transition-transform", open && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div className={slot(t.dropdown)}>
          {options.map(opt => {
            const s = String(opt);
            const checked = selected.includes(s);
            return (
              <label key={s} className={slot(t.dropdownItem)}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(s)}
                  className="rounded text-blue-500 border-gray-300"
                />
                <span className={slot(t.optionText)}>{s}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}