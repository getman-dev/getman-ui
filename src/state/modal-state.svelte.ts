/** Owns load-modal, keyboard-shortcuts overlay, and command bar state. */
export const modalState = $state({
  modalVisible: false,
  modalError: "",
  modalUrlValue: "",
  shortcutsVisible: false,
  commandBarVisible: false,
});