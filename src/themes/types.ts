/**
 * Central theme mode type. All per-component theme objects are keyed by ThemeMode.
 * Adding a new mode here forces TypeScript to flag every Record<ThemeMode, XxxTheme>
 * that is missing the new key.
 */

/**
 * The available UI colour modes.
 * 'default' is the standard light appearance; 'dark' is the dark appearance.
 */
export type ThemeMode = 'default' | 'dark';