/** React Context for server selection, URL variable substitution, and popover state. */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Server } from "../types/openapi";

interface ServerState {
  selectedServer: string;
  serverVariables: Record<string, string>;
  serverPopoverSource: "topbar" | "playground" | null;
}

interface ServerContextActions {
  setSelectedServer: (url: string) => void;
  setServerVariables: (vars: Record<string, string>) => void;
  setServerVariable: (name: string, value: string) => void;
  setServerPopoverSource: (source: "topbar" | "playground" | null) => void;
}

type ServerContextValue = ServerState & ServerContextActions;

const defaultState: ServerState = {
  selectedServer: "",
  serverVariables: {},
  serverPopoverSource: null,
};

export let serverSnapshot: ServerState = { ...defaultState };
export const serverActions: ServerContextActions = {
  setSelectedServer: () => {},
  setServerVariables: () => {},
  setServerVariable: () => {},
  setServerPopoverSource: () => {},
};

/** Builds initial variable values from a server's variable defaults. */
export function initServerVariables(server: Server | undefined): Record<string, string> {
  if (!server?.variables) return {};
  return Object.fromEntries(
    Object.entries(server.variables).map(([name, v]) => [name, v.default])
  );
}

const ServerContext = createContext<ServerContextValue>(null!);

/** Provides server selection and variable state to the component tree. */
export function ServerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ServerState>(defaultState);

  const setSelectedServer = useCallback((selectedServer: string) => {
    serverSnapshot = { ...serverSnapshot, selectedServer };
    setState(s => ({ ...s, selectedServer }));
  }, []);
  const setServerVariables = useCallback((serverVariables: Record<string, string>) => {
    serverSnapshot = { ...serverSnapshot, serverVariables };
    setState(s => ({ ...s, serverVariables }));
  }, []);
  const setServerVariable = useCallback((name: string, value: string) => {
    serverSnapshot = { ...serverSnapshot, serverVariables: { ...serverSnapshot.serverVariables, [name]: value } };
    setState(s => ({ ...s, serverVariables: { ...s.serverVariables, [name]: value } }));
  }, []);
  const setServerPopoverSource = useCallback((serverPopoverSource: "topbar" | "playground" | null) => {
    serverSnapshot = { ...serverSnapshot, serverPopoverSource };
    setState(s => ({ ...s, serverPopoverSource }));
  }, []);

  serverSnapshot = state;
  serverActions.setSelectedServer = setSelectedServer;
  serverActions.setServerVariables = setServerVariables;
  serverActions.setServerVariable = setServerVariable;
  serverActions.setServerPopoverSource = setServerPopoverSource;

  const value = useMemo(
    () => ({ ...state, setSelectedServer, setServerVariables, setServerVariable, setServerPopoverSource }),
    [state, setSelectedServer, setServerVariables, setServerVariable, setServerPopoverSource]
  );
  return <ServerContext.Provider value={value}>{children}</ServerContext.Provider>;
}

/** Returns server context. Must be called inside ServerProvider. */
export const useServer = () => useContext(ServerContext);
