/** Input component theme interfaces — all seven playground input types. */
import type { ThemeSlot } from '../slot';

export interface ScalarInputTheme {
  input:        ThemeSlot;
  inputInvalid: ThemeSlot;
}

export interface BooleanSelectTheme {
  select:        ThemeSlot;
  selectInvalid: ThemeSlot;
}

export interface EnumSelectTheme {
  select:        ThemeSlot;
  selectInvalid: ThemeSlot;
}

export interface FileInputTheme {
  input: ThemeSlot;
}

export interface ArrayInputTheme {
  rowInput:        ThemeSlot;
  rowInputInvalid: ThemeSlot;
  rowIndex:        ThemeSlot;
  removeButton:    ThemeSlot;
  addButton:       ThemeSlot;
  hint:            ThemeSlot;
}

export interface MultiSelectTheme {
  trigger:        ThemeSlot;
  triggerInvalid: ThemeSlot;
  placeholder:    ThemeSlot;
  dropdown:       ThemeSlot;
  dropdownItem:   ThemeSlot;
  optionText:     ThemeSlot;
}

export interface ObjectInputTheme {
  textarea:        ThemeSlot;
  textareaInvalid: ThemeSlot;
}