/** SchemaDetailTheme — slots for the component schema detail view. */
import type { ThemeSlot } from '../slot';

export interface SchemaDetailTheme {
  header:          ThemeSlot;
  typeBadge:       ThemeSlot;
  schemaName:      ThemeSlot;
  description:     ThemeSlot;
  sectionLabel:    ThemeSlot;
  schemaBox:       ThemeSlot;
  typeBadgeColors: Record<string, string>;
}