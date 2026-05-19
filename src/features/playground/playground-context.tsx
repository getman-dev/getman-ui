/** React Context for the try-it-out panel: params, request body, files, and response. */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { EndpointEntry, PlaygroundResponse } from "../spec/openapi";

interface PlaygroundState {
  endpoint: EndpointEntry | null;
  paramValues: Record<string, string>;
  bodyValue: string;
  bodyParams: Record<string, string>;
  fileValues: Record<string, File | File[]>;
  response: PlaygroundResponse | null;
  loading: boolean;
}

interface PlaygroundContextActions {
  setEndpoint: (ep: EndpointEntry | null) => void;
  setParamValues: (vals: Record<string, string>) => void;
  setBodyValue: (val: string) => void;
  setBodyParams: (params: Record<string, string>) => void;
  setFileValues: (files: Record<string, File | File[]>) => void;
  setResponse: (response: PlaygroundResponse | null) => void;
  setLoading: (loading: boolean) => void;
  reset: (ep: EndpointEntry | null) => void;
}

type PlaygroundContextValue = PlaygroundState & PlaygroundContextActions;

const defaultState: PlaygroundState = {
  endpoint: null,
  paramValues: {},
  bodyValue: "",
  bodyParams: {},
  fileValues: {},
  response: null,
  loading: false,
};

export let playgroundSnapshot: PlaygroundState = { ...defaultState };
export const playgroundActions: PlaygroundContextActions = {
  setEndpoint: () => {},
  setParamValues: () => {},
  setBodyValue: () => {},
  setBodyParams: () => {},
  setFileValues: () => {},
  setResponse: () => {},
  setLoading: () => {},
  reset: () => {},
};

const PlaygroundContext = createContext<PlaygroundContextValue>(null!);

/** Provides try-it-out panel state to the component tree. */
export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlaygroundState>(defaultState);

  const setEndpoint = useCallback((endpoint: EndpointEntry | null) => {
    playgroundSnapshot = { ...playgroundSnapshot, endpoint };
    setState(s => ({ ...s, endpoint }));
  }, []);
  const setParamValues = useCallback((paramValues: Record<string, string>) => {
    playgroundSnapshot = { ...playgroundSnapshot, paramValues };
    setState(s => ({ ...s, paramValues }));
  }, []);
  const setBodyValue = useCallback((bodyValue: string) => {
    playgroundSnapshot = { ...playgroundSnapshot, bodyValue };
    setState(s => ({ ...s, bodyValue }));
  }, []);
  const setBodyParams = useCallback((bodyParams: Record<string, string>) => {
    playgroundSnapshot = { ...playgroundSnapshot, bodyParams };
    setState(s => ({ ...s, bodyParams }));
  }, []);
  const setFileValues = useCallback((fileValues: Record<string, File | File[]>) => {
    playgroundSnapshot = { ...playgroundSnapshot, fileValues };
    setState(s => ({ ...s, fileValues }));
  }, []);
  const setResponse = useCallback((response: PlaygroundResponse | null) => {
    playgroundSnapshot = { ...playgroundSnapshot, response };
    setState(s => ({ ...s, response }));
  }, []);
  const setLoading = useCallback((loading: boolean) => {
    playgroundSnapshot = { ...playgroundSnapshot, loading };
    setState(s => ({ ...s, loading }));
  }, []);
  const reset = useCallback((endpoint: EndpointEntry | null) => {
    const next = { ...defaultState, endpoint };
    playgroundSnapshot = next;
    setState(next);
  }, []);

  playgroundSnapshot = state;
  playgroundActions.setEndpoint = setEndpoint;
  playgroundActions.setParamValues = setParamValues;
  playgroundActions.setBodyValue = setBodyValue;
  playgroundActions.setBodyParams = setBodyParams;
  playgroundActions.setFileValues = setFileValues;
  playgroundActions.setResponse = setResponse;
  playgroundActions.setLoading = setLoading;
  playgroundActions.reset = reset;

  const value = useMemo(
    () => ({ ...state, setEndpoint, setParamValues, setBodyValue, setBodyParams, setFileValues, setResponse, setLoading, reset }),
    [state, setEndpoint, setParamValues, setBodyValue, setBodyParams, setFileValues, setResponse, setLoading, reset]
  );
  return <PlaygroundContext.Provider value={value}>{children}</PlaygroundContext.Provider>;
}

/** Returns playground context. Must be called inside PlaygroundProvider. */
export const usePlayground = () => useContext(PlaygroundContext);
