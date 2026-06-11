/** SendBarTheme — slots for the URL preview bar and Send button. */
import type { ThemeSlot } from '../slot';

export interface SendBarTheme {
  container:          ThemeSlot;
  urlBox:             ThemeSlot;
  urlCode:            ThemeSlot;
  sendButtonActive:   ThemeSlot;
  sendButtonDisabled: ThemeSlot;
}