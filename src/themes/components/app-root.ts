/** AppRootTheme — slots for the root layout, pane wrappers, and keyboard shortcuts panel. */
import type { ThemeSlot } from '../slot';

export interface AppRootTheme {
  root:              ThemeSlot;
  navPane:           ThemeSlot;
  detailPane:        ThemeSlot;
  tryPane:           ThemeSlot;
  shortcutsBackdrop: ThemeSlot;
  shortcutsPanel:    ThemeSlot;
  shortcutsHeader:   ThemeSlot;
  shortcutsTitle:    ThemeSlot;
  shortcutsClose:    ThemeSlot;
  shortcutsRow:      ThemeSlot;
  shortcutsDesc:     ThemeSlot;
  shortcutsKbd:      ThemeSlot;
}
