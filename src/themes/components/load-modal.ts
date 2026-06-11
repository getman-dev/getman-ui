/** LoadModalTheme — slots for the spec loader modal. */
import type { ThemeSlot } from '../slot';

export interface LoadModalTheme {
  title:        ThemeSlot;
  footerText:   ThemeSlot;
  petstoreLink: ThemeSlot;
  urlLabel:     ThemeSlot;
  urlInput:     ThemeSlot;
  dividerLine:  ThemeSlot;
  dividerText:  ThemeSlot;
  fileLabel:    ThemeSlot;
  fileDropZone: ThemeSlot;
  fileDropIcon: ThemeSlot;
  fileDropText: ThemeSlot;
  errorBanner:  ThemeSlot;
}