/**
 * Theme registry: built-in themes, lookup helpers, and the mergeTheme utility.
 * Import from here to resolve a theme by name or to compose a custom one.
 */
import type { AppTheme } from './contract';
import { lightTheme } from './presets/light';
import { darkTheme }  from './presets/dark';

export type { AppTheme } from './contract';
export { useTheme, ThemeProvider } from './context';
export { slot } from './slot';
export type { ThemeSlot } from './slot';
export { lightTheme, darkTheme };

/** All built-in themes keyed by their preset name. */
export const THEMES: Record<string, AppTheme> = {
  light: lightTheme,
  dark:  darkTheme,
};

/**
 * Returns the built-in theme for the given name, or undefined if not registered.
 */
export function getTheme(name: string): AppTheme | undefined {
  return THEMES[name];
}

/** Returns the names of all registered built-in themes. */
export function listThemes(): string[] {
  return Object.keys(THEMES);
}

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/**
 * Creates a new AppTheme by merging per-component overrides onto a base preset.
 * Each top-level key is shallowly merged: override slots replace matching base slots,
 * unspecified slots are inherited from the base.
 *
 * @example
 * mergeTheme(myTheme, { nav: { container: 'bg-brand-950 border-r border-brand-800' } })
 */
export function mergeTheme(base: AppTheme, overrides: DeepPartial<AppTheme>): AppTheme {
  const result = { ...base };
  for (const key of Object.keys(overrides) as (keyof AppTheme)[]) {
    const override = overrides[key];
    if (override === undefined) continue;
    const baseVal = base[key];
    if (typeof baseVal === 'object' && baseVal !== null && typeof override === 'object' && override !== null) {
      (result as Record<string, unknown>)[key] = { ...baseVal as object, ...override as object };
    } else {
      (result as Record<string, unknown>)[key] = override;
    }
  }
  return result;
}