/** NavTheme — slots for the sidebar navigation component. */
import type { ThemeSlot } from '../slot';

export interface NavTheme {
  container:         ThemeSlot;
  divider:           ThemeSlot;
  searchWrapper:     ThemeSlot;
  searchInput:       ThemeSlot;
  searchIcon:        ThemeSlot;
  searchClearButton: ThemeSlot;
  searchHint:        ThemeSlot;
  loadingSpinner:    ThemeSlot;
  tabBar:            ThemeSlot;
  tab:               ThemeSlot; // variants: active
  tagHeader:         ThemeSlot;
  tagChevron:        ThemeSlot;
  tagCount:          ThemeSlot;
  endpointItem:      ThemeSlot; // variants: active
  endpointPath:      ThemeSlot;
  methodBadge:       ThemeSlot; // variants: get, post, put, patch, delete, head, options
  schemaItem:        ThemeSlot; // variants: active
  schemaName:        ThemeSlot; // variants: active
  schemaTypeBadge:   ThemeSlot;
  schemaDescription: ThemeSlot;
  emptyState:        ThemeSlot;
}
