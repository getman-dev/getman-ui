/** Owns try-it-out panel state: parameters, request body, files, and response. */
import type { EndpointEntry, PlaygroundState, PlaygroundResponse } from "../types/openapi";

function createPlaygroundState() {
  let endpoint: EndpointEntry | null = null;
  let paramValues: Record<string, string> = {};
  let bodyValue = "";
  let bodyParams: Record<string, string> = {};
  let fileValues: Record<string, File | File[]> = {};
  let response: PlaygroundResponse | null = null;
  let loading = false;
  const subs = new Set<() => void>();
  const notify = () => subs.forEach(fn => fn());

  return {
    get endpoint()    { return endpoint; },
    get paramValues() { return paramValues; },
    get bodyValue()   { return bodyValue; },
    get bodyParams()  { return bodyParams; },
    get fileValues()  { return fileValues; },
    get response()    { return response; },
    get loading()     { return loading; },

    /** Returns a PlaygroundState snapshot for passing to render functions. */
    snapshot(): PlaygroundState {
      return { endpoint, paramValues, bodyValue, bodyParams, fileValues, response, loading };
    },

    reset(ep: EndpointEntry | null) {
      endpoint = ep; paramValues = {}; bodyValue = ""; bodyParams = {};
      fileValues = {}; response = null; loading = false;
      notify();
    },

    // Silent setters — user input fields; callers handle targeted DOM updates (e.g. URL preview).
    setParam(name: string, value: string)       { paramValues = { ...paramValues, [name]: value }; },
    setBody(value: string)                      { bodyValue = value; },
    setBodyParam(name: string, value: string)   { bodyParams = { ...bodyParams, [name]: value }; },
    setFile(name: string, value: File | File[]) { fileValues = { ...fileValues, [name]: value }; },

    startLoading()                        { loading = true; response = null; notify(); },
    setResponse(r: PlaygroundResponse | null) { response = r; loading = false; notify(); },

    sub(fn: () => void) { subs.add(fn); return () => subs.delete(fn); },
  };
}

export const playgroundState = createPlaygroundState();