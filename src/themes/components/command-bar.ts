/** CommandBarTheme — slots for the ⌘K command palette overlay. */
import type { ThemeSlot } from '../slot';

export interface CommandBarTheme {
  backdrop:       ThemeSlot;
  container:      ThemeSlot;
  searchRow:      ThemeSlot;
  searchIcon:     ThemeSlot;
  input:          ThemeSlot;
  clearButton:    ThemeSlot;
  groupTitle:     ThemeSlot;
  resultItem:     ThemeSlot; // variants: active
  actionIcon:     ThemeSlot; // variants: active
  resultLabel:    ThemeSlot;
  resultSubtitle: ThemeSlot;
  activeChevron:  ThemeSlot;
  emptyIcon:      ThemeSlot;
  emptyText:      ThemeSlot;
  footer:         ThemeSlot;
  shortcutText:   ThemeSlot;
  shortcutBadge:  ThemeSlot;
  specTitle:      ThemeSlot;
  highlightMark:  string;
}