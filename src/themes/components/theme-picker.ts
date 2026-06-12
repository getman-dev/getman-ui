/** ThemePickerTheme — slots for the theme picker dropdown. */
import type { ThemeSlot } from '../slot';

export interface ThemePickerTheme {
  /** Floating dropdown container. */
  dropdown: ThemeSlot;
  /** Individual theme row — base and active (currently selected) variants. */
  item:     { base: ThemeSlot; active: ThemeSlot };
  /** Theme display name text. */
  name:     ThemeSlot;
  /** Checkmark shown on the active row. */
  check:    ThemeSlot;
}