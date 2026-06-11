/** SchemaNodeTheme — slots for recursive schema property rows. */
import type { ThemeSlot } from '../slot';

export interface SchemaNodeTheme {
  name:            ThemeSlot;
  typeBadge:       ThemeSlot;
  nullableBadge:   ThemeSlot;
  constraint:      ThemeSlot;
  enumValue:       ThemeSlot;
  description:     ThemeSlot;
  enumKey:         ThemeSlot;
  enumDesc:        ThemeSlot;
  nestedBorder:    ThemeSlot;
  typeBadgeColors: Record<string, string>;
}