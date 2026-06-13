/** Compact dropdown with checkboxes for array parameters with a fixed enum set. */
import {useEffect, useRef, useState} from "react";
import clsx from "clsx";
import {slot, type ThemeSlot} from "../../../themes/slot";
import {useTheme} from "../../../themes/context";

export interface MultiSelectTheme {
  trigger: ThemeSlot;
  triggerInvalid: ThemeSlot;
  placeholder: ThemeSlot;
  dropdown: ThemeSlot;
  dropdownItem: ThemeSlot;
  optionText: ThemeSlot;
}

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
  const t = useTheme().inputMultiSelect;
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