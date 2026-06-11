/** SchemaViewerTheme — slots for the tabbed schema + example viewer. */
import type { ThemeSlot } from '../slot';

export interface SchemaViewerTheme {
  tabBar:       ThemeSlot;
  tabActive:    ThemeSlot;
  tabInactive:  ThemeSlot;
  description:  ThemeSlot;
  exampleBlock: ThemeSlot;
}