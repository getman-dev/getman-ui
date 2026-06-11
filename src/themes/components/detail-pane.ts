/** DetailPaneTheme — slots for the detail pane loading, error, and empty states. */
import type { ThemeSlot } from '../slot';

export interface DetailPaneTheme {
  spinner:      ThemeSlot;
  errorIcon:    ThemeSlot;
  errorMessage: ThemeSlot;
  retryLink:    ThemeSlot;
  emptyIcon:    ThemeSlot;
  emptyMessage: ThemeSlot;
}