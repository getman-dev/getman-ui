/** React Context for the parsed OpenAPI spec and derived tag groups. */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { OpenAPISpec, TagGroup } from "./openapi";

interface SpecState {
  spec: OpenAPISpec | null;
  groups: TagGroup[];
  specLoading: boolean;
}

interface SpecContextActions {
  setSpec: (spec: OpenAPISpec | null) => void;
  setGroups: (groups: TagGroup[]) => void;
  setSpecLoading: (loading: boolean) => void;
}

type SpecContextValue = SpecState & SpecContextActions;

export let specSnapshot: SpecState = { spec: null, groups: [], specLoading: false };
export const specActions: SpecContextActions = {
  setSpec: () => {},
  setGroups: () => {},
  setSpecLoading: () => {},
};

const SpecContext = createContext<SpecContextValue>(null!);

/** Provides parsed spec and tag groups to the component tree. */
export function SpecProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SpecState>({ spec: null, groups: [], specLoading: false });

  const setSpec = useCallback((spec: OpenAPISpec | null) => {
    specSnapshot = { ...specSnapshot, spec };
    setState(s => ({ ...s, spec }));
  }, []);
  const setGroups = useCallback((groups: TagGroup[]) => {
    specSnapshot = { ...specSnapshot, groups };
    setState(s => ({ ...s, groups }));
  }, []);
  const setSpecLoading = useCallback((specLoading: boolean) => {
    specSnapshot = { ...specSnapshot, specLoading };
    setState(s => ({ ...s, specLoading }));
  }, []);

  specSnapshot = state;
  specActions.setSpec = setSpec;
  specActions.setGroups = setGroups;
  specActions.setSpecLoading = setSpecLoading;

  const value = useMemo(
    () => ({ ...state, setSpec, setGroups, setSpecLoading }),
    [state, setSpec, setGroups, setSpecLoading],
  );
  return <SpecContext.Provider value={value}>{children}</SpecContext.Provider>;
}

/** Returns spec context. Must be called inside SpecProvider. */
export const useSpec = () => useContext(SpecContext);
