/** Owns try-it-out panel state: parameters, request body, files, and response. */
import type { EndpointEntry, PlaygroundResponse } from "../types/openapi";

export const playgroundState = $state({
  endpoint: null as EndpointEntry | null,
  paramValues: {} as Record<string, string>,
  bodyValue: "",
  bodyParams: {} as Record<string, string>,
  fileValues: {} as Record<string, File | File[]>,
  response: null as PlaygroundResponse | null,
  loading: false,
});