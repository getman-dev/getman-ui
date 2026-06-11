/** AuthStatusTheme — slots for the security scheme status rows in the playground. */
import type { ThemeSlot } from '../slot';

export interface AuthStatusTheme {
  sectionLabel:      ThemeSlot;
  emptyText:         ThemeSlot;
  schemeRow:         ThemeSlot;
  schemeName:        ThemeSlot;
  schemeType:        ThemeSlot;
  authorizedBadge:   ThemeSlot;
  unauthorizedBadge: ThemeSlot;
}