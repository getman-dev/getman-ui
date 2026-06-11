/** PlaygroundTheme — slots for the try-it-out panel. */
import type { ThemeSlot } from '../slot';

export interface PlaygroundTheme {
  container:           ThemeSlot;
  header:              ThemeSlot;
  headerTitle:         ThemeSlot;
  emptyState:          ThemeSlot;
  emptyIconWrapper:    ThemeSlot;
  emptyIcon:           ThemeSlot;
  emptyText:           ThemeSlot;
  inputLabel:          ThemeSlot;
  textInput:           ThemeSlot;
  selectInput:         ThemeSlot;
  fileInput:           ThemeSlot;
  fileInputButton:     ThemeSlot; // variants: hasFile
  bodyEditor:          ThemeSlot;
  contentTypeSelector: ThemeSlot;
  sendButton:          ThemeSlot; // variants: loading, disabled
  responsePanel:       ThemeSlot;
  responseStatus:      ThemeSlot; // variants: success, redirect, clientError, serverError
  responseTime:        ThemeSlot;
  responseSize:        ThemeSlot;
  responseTabs:        ThemeSlot;
  responseTab:         ThemeSlot; // variants: active
  responseBody:        ThemeSlot;
  responseEmpty:       ThemeSlot;
  errorBanner:         ThemeSlot;
}