/** React Context for the parsed OpenAPI spec and derived tag groups. */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { OpenAPISpec, TagGroup } from "../types/openapi";

interface SpecState {
  spec: OpenAPISpec | null;
  groups: TagGroup[];
}

interface SpecContextActions {
  setSpec: (spec: OpenAPISpec | null) => void;
  setGroups: (groups: TagGroup[]) => void;
}

type SpecContextValue = SpecState & SpecContextActions;

export let specSnapshot: SpecState = { spec: null, groups: [] };
export const specActions: SpecContextActions = {
  setSpec: () => {},
  setGroups: () => {},
};

const SpecContext = createContext<SpecContextValue>(null!);

/** Provides parsed spec and tag groups to the component tree. */
export function SpecProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SpecState>({ spec: null, groups: [] });

  const setSpec = useCallback((spec: OpenAPISpec | null) => {
    specSnapshot = { ...specSnapshot, spec };
    setState(s => ({ ...s, spec }));
  }, []);
  const setGroups = useCallback((groups: TagGroup[]) => {
    specSnapshot = { ...specSnapshot, groups };
    setState(s => ({ ...s, groups }));
  }, []);

  specSnapshot = state;
  specActions.setSpec = setSpec;
  specActions.setGroups = setGroups;

  const value = useMemo(() => ({ ...state, setSpec, setGroups }), [state, setSpec, setGroups]);
  return <SpecContext.Provider value={value}>{children}</SpecContext.Provider>;
}

/** Returns spec context. Must be called inside SpecProvider. */
export const useSpec = () => useContext(SpecContext);
