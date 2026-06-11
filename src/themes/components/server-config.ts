/** ServerConfigTheme — slots for the server chip and configuration popover. */
import type { ThemeSlot } from '../slot';

export interface ServerConfigTheme {
  chip:                ThemeSlot; // variants: open
  chipIcon:            ThemeSlot;
  backdrop:            ThemeSlot;
  popover:             ThemeSlot;
  popoverHeader:       ThemeSlot;
  headerIcon:          ThemeSlot;
  headerTitle:         ThemeSlot;
  closeButton:         ThemeSlot;
  sectionDivider:      ThemeSlot;
  sectionLabel:        ThemeSlot;
  serverSelect:        ThemeSlot;
  variableName:        ThemeSlot;
  variableDescription: ThemeSlot;
  variableInput:       ThemeSlot;
  resolvedSection:     ThemeSlot;
  resolvedLabel:       ThemeSlot;
  resolvedValue:       ThemeSlot;
}