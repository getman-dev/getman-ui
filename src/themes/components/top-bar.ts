/** TopBarTheme — slots for the top application bar. */
import type { ThemeSlot } from '../slot';

export interface TopBarTheme {
  container:              ThemeSlot;
  specTitle:              ThemeSlot;
  specVersion:            ThemeSlot;
  specDescription:        ThemeSlot;
  noSpecIcon:             ThemeSlot;
  noSpecIconSvg:          ThemeSlot;
  noSpecTitle:            ThemeSlot;
  divider:                ThemeSlot;
  authButtonConfigured:   ThemeSlot;
  authButtonUnconfigured: ThemeSlot;
  neutralButton:          ThemeSlot;
  loadButton:             ThemeSlot;
}