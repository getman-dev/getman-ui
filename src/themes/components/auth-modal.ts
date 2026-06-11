/** AuthModalTheme — slots for the authorization modal. */
import type { ThemeSlot } from '../slot';

export interface AuthModalTheme {
  tabBar:            ThemeSlot;
  tabActive:         ThemeSlot;
  tabInactive:       ThemeSlot;
  titleIcon:         ThemeSlot;
  titleText:         ThemeSlot;
  closeButton:       ThemeSlot;
  schemeType:        ThemeSlot;
  authorizedBadge:   ThemeSlot;
  schemeDescription: ThemeSlot;
  fieldLabel:        ThemeSlot;
  fieldLabelHint:    ThemeSlot;
  input:             ThemeSlot;
  tokenWrapper:      ThemeSlot;
  tokenPrefix:       ThemeSlot;
  tokenField:        ThemeSlot;
  saveButton:        ThemeSlot;
  clearButton:       ThemeSlot;
}