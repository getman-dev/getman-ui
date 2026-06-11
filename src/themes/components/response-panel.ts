/** ResponsePanelTheme — slots for the response viewer in the playground. */
import type { ThemeSlot } from '../slot';

export interface ResponsePanelTheme {
  loadingState:  ThemeSlot;
  emptyState:    ThemeSlot;
  emptyText:     ThemeSlot;
  container:     ThemeSlot;
  tabBar:        ThemeSlot;
  tab:           ThemeSlot; // variant: active
  tabDivider:    ThemeSlot;
  headerCount:   ThemeSlot;
  copyButton:    ThemeSlot; // variant: copied
  statusNeutral: ThemeSlot;
  statusSuccess: ThemeSlot;
  statusError:   ThemeSlot;
  bodyContainer: ThemeSlot;
  bodyPre:       ThemeSlot;
  headersPre:    ThemeSlot;
}