/** React Context for load-modal, keyboard-shortcuts overlay, and command bar. */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface ModalState {
  modalVisible: boolean;
  modalError: string;
  modalUrlValue: string;
  shortcutsVisible: boolean;
  commandBarVisible: boolean;
}

interface ModalContextActions {
  setModalVisible: (visible: boolean) => void;
  setModalError: (error: string) => void;
  setModalUrlValue: (value: string) => void;
  setShortcutsVisible: (visible: boolean) => void;
  setCommandBarVisible: (visible: boolean) => void;
}

type ModalContextValue = ModalState & ModalContextActions;

const defaultState: ModalState = {
  modalVisible: false,
  modalError: "",
  modalUrlValue: "",
  shortcutsVisible: false,
  commandBarVisible: false,
};

export let modalSnapshot: ModalState = { ...defaultState };
export const modalActions: ModalContextActions = {
  setModalVisible: () => {},
  setModalError: () => {},
  setModalUrlValue: () => {},
  setShortcutsVisible: () => {},
  setCommandBarVisible: () => {},
};

const ModalContext = createContext<ModalContextValue>(null!);

/** Provides modal and overlay state to the component tree. */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>(defaultState);

  const setModalVisible = useCallback((modalVisible: boolean) => {
    modalSnapshot = { ...modalSnapshot, modalVisible };
    setState(s => ({ ...s, modalVisible }));
  }, []);
  const setModalError = useCallback((modalError: string) => {
    modalSnapshot = { ...modalSnapshot, modalError };
    setState(s => ({ ...s, modalError }));
  }, []);
  const setModalUrlValue = useCallback((modalUrlValue: string) => {
    modalSnapshot = { ...modalSnapshot, modalUrlValue };
    setState(s => ({ ...s, modalUrlValue }));
  }, []);
  const setShortcutsVisible = useCallback((shortcutsVisible: boolean) => {
    modalSnapshot = { ...modalSnapshot, shortcutsVisible };
    setState(s => ({ ...s, shortcutsVisible }));
  }, []);
  const setCommandBarVisible = useCallback((commandBarVisible: boolean) => {
    modalSnapshot = { ...modalSnapshot, commandBarVisible };
    setState(s => ({ ...s, commandBarVisible }));
  }, []);

  modalSnapshot = state;
  modalActions.setModalVisible = setModalVisible;
  modalActions.setModalError = setModalError;
  modalActions.setModalUrlValue = setModalUrlValue;
  modalActions.setShortcutsVisible = setShortcutsVisible;
  modalActions.setCommandBarVisible = setCommandBarVisible;

  const value = useMemo(
    () => ({ ...state, setModalVisible, setModalError, setModalUrlValue, setShortcutsVisible, setCommandBarVisible }),
    [state, setModalVisible, setModalError, setModalUrlValue, setShortcutsVisible, setCommandBarVisible]
  );
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

/** Returns modal context. Must be called inside ModalProvider. */
export const useModal = () => useContext(ModalContext);
