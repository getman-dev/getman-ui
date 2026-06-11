/** EndpointTheme — slots for the endpoint documentation view. */
import type { ThemeSlot } from '../slot';

export interface EndpointTheme {
  container:           ThemeSlot;
  header:              ThemeSlot;
  methodBadge:         ThemeSlot; // variants: get, post, put, patch, delete, head, options
  path:                ThemeSlot;
  summary:             ThemeSlot;
  description:         ThemeSlot;
  deprecated:          ThemeSlot;
  paramSection:        ThemeSlot;
  paramSectionTitle:   ThemeSlot;
  paramLocTitle:       ThemeSlot;
  paramRow:            ThemeSlot;
  paramName:           ThemeSlot;
  paramType:           ThemeSlot;
  paramRequired:       ThemeSlot;
  paramDescription:    ThemeSlot;
  mutedText:           ThemeSlot;
  responseAccordion:   ThemeSlot;
  responseHeader:      ThemeSlot;
  responseStatusCode:  ThemeSlot; // variants: success, redirect, clientError, serverError
  responseDescription: ThemeSlot;
  bodySection:         ThemeSlot;
  bodyContentType:     ThemeSlot;
}
