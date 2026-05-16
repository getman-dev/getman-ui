/** Owns load-modal and keyboard-shortcuts overlay state. */

function createModalState() {
  let modalVisible = false;
  let modalError = "";
  let modalUrlValue = "";
  let shortcutsVisible = false;
  const subs = new Set<() => void>();
  const notify = () => subs.forEach(fn => fn());

  return {
    get modalVisible()     { return modalVisible; },
    get modalError()       { return modalError; },
    get modalUrlValue()    { return modalUrlValue; },
    get shortcutsVisible() { return shortcutsVisible; },
    open()  { modalVisible = true; shortcutsVisible = false; modalError = ""; notify(); },
    close() { modalVisible = false; modalError = ""; notify(); },
    setError(err: string) { modalError = err; notify(); },
    setUrlValue(url: string) { modalUrlValue = url; }, // silent — only read on submit
    openShortcuts()  { shortcutsVisible = true; modalVisible = false; notify(); },
    closeShortcuts() { shortcutsVisible = false; notify(); },
    toggleShortcuts() {
      shortcutsVisible = !shortcutsVisible;
      if (shortcutsVisible) modalVisible = false;
      notify();
    },
    sub(fn: () => void) { subs.add(fn); return () => subs.delete(fn); },
  };
}

export const modalState = createModalState();