/** React Context for load-modal, keyboard-shortcuts overlay, and command bar. */
import type {ReactNode} from "react";
import {createContext, useCallback, useContext, useMemo, useState} from "react";

interface ModalState {
  modalVisible: boolean;
  modalUrlValue: string;
  shortcutsVisible: boolean;
  commandBarVisible: boolean;
}

interface ModalContextActions {
  setModalVisible: (visible: boolean) => void;
  setModalUrlValue: (value: string) => void;
  setShortcutsVisible: (visible: boolean) => void;
  setCommandBarVisible: (visible: boolean) => void;
}

type ModalContextValue = ModalState & ModalContextActions;

const defaultState: ModalState = {
  modalVisible: false,
  modalUrlValue: "",
  shortcutsVisible: false,
  commandBarVisible: false,
};

export let modalSnapshot: ModalState = {...defaultState};
export const modalActions: ModalContextActions = {
  setModalVisible: () => {
  },
  setModalUrlValue: () => {
  },
  setShortcutsVisible: () => {
  },
  setCommandBarVisible: () => {
  },
};

const ModalContext = createContext<ModalContextValue>(null!);

/** Provides modal and overlay state to the component tree. */
export function ModalProvider({children}: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>(defaultState);

  const setModalVisible = useCallback((modalVisible: boolean) => {
    modalSnapshot = {...modalSnapshot, modalVisible};
    setState(s => ({...s, modalVisible}));
  }, []);
  const setModalUrlValue = useCallback((modalUrlValue: string) => {
    modalSnapshot = {...modalSnapshot, modalUrlValue};
    setState(s => ({...s, modalUrlValue}));
  }, []);
  const setShortcutsVisible = useCallback((shortcutsVisible: boolean) => {
    modalSnapshot = {...modalSnapshot, shortcutsVisible};
    setState(s => ({...s, shortcutsVisible}));
  }, []);
  const setCommandBarVisible = useCallback((commandBarVisible: boolean) => {
    modalSnapshot = {...modalSnapshot, commandBarVisible};
    setState(s => ({...s, commandBarVisible}));
  }, []);

  modalSnapshot = state;
  modalActions.setModalVisible = setModalVisible;
  modalActions.setModalUrlValue = setModalUrlValue;
  modalActions.setShortcutsVisible = setShortcutsVisible;
  modalActions.setCommandBarVisible = setCommandBarVisible;

  const value = useMemo(
      () => ({...state, setModalVisible, setModalUrlValue, setShortcutsVisible, setCommandBarVisible}),
      [state, setModalVisible, setModalUrlValue, setShortcutsVisible, setCommandBarVisible]
  );
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

/** Returns modal context. Must be called inside ModalProvider. */
export const useModal = () => useContext(ModalContext);
