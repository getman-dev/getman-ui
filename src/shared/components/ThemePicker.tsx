/** Dropdown theme picker: trigger button with current theme name, opens a list of all themes with color swatches. */
import { useState, useRef, useEffect } from 'react';
import { listThemes } from '../../themes';
import { useTheme } from '../../themes/context';
import { slot } from '../../themes/slot';

/** Display name for each built-in theme. */
const THEME_LABELS: Record<string, string> = {
  light:      'Light',
  dark:       'Dark',
  nord:       'Nord',
  catppuccin: 'Catppuccin',
  terminal:   'Terminal',
};

/**
 * Three representative hex colors (background, accent, text) shown as swatches for each theme.
 * Hardcoded so they remain accurate regardless of the currently active theme.
 */
const THEME_SWATCHES: Record<string, [string, string, string]> = {
  light:      ['#f9fafb', '#2563eb', '#111827'],
  dark:       ['#1f2937', '#60a5fa', '#f3f4f6'],
  nord:       ['#2E3440', '#88C0D0', '#ECEFF4'],
  catppuccin: ['#1E1E2E', '#CBA6F7', '#CDD6F4'],
  terminal:   ['#030a03', '#00ff41', '#33cc33'],
};

interface Props {
  onSetTheme: (name: string) => void;
}

/** Renders a dropdown button for switching between all registered themes. */
export default function ThemePicker({ onSetTheme }: Props) {
  const theme = useTheme();
  const t = theme.themePicker;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const label = THEME_LABELS[theme.name] ?? theme.name;

  return (
    <div ref={ref} className="relative">
      <button
        title="Switch theme"
        onClick={() => setOpen(o => !o)}
        className={slot(theme.topBar.neutralButton)}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
        </svg>
        <span>{label}</span>
        <svg
          className={`w-2.5 h-2.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-1.5 z-50 w-52 ${slot(t.dropdown)}`}>
          {listThemes().map(name => {
            const swatches = THEME_SWATCHES[name] ?? ['#888', '#888', '#888'];
            const isActive = theme.name === name;
            return (
              <button
                key={name}
                onClick={() => { onSetTheme(name); setOpen(false); }}
                className={`${slot(t.item.base)}${isActive ? ` ${slot(t.item.active)}` : ''}`}
              >
                <div className="flex gap-1 shrink-0">
                  {swatches.map((color, i) => (
                    <div
                      key={i}
                      style={{ background: color }}
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-sm"
                    />
                  ))}
                </div>
                <span className={slot(t.name)}>{THEME_LABELS[name] ?? name}</span>
                {isActive && (
                  <svg className={slot(t.check)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}