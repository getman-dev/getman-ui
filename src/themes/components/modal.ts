/** ModalTheme — slots for the reusable modal shell. */
import type { ThemeSlot } from '../slot';

export interface ModalTheme {
  backdrop:    ThemeSlot;
  container:   ThemeSlot;
  header:      ThemeSlot;
  closeButton: ThemeSlot;
  footer:      ThemeSlot;
}