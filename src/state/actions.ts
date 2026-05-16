/** Cross-module state operations that mutate more than one store atomically. */
import type { EndpointEntry, OpenAPISpec, Server } from "../types/openapi";
import { specState } from "./spec-state";
import { navState } from "./nav-state";
import { serverState } from "./server-state";
import { playgroundState } from "./playground-state";
import { modalState } from "./modal-state";
import { parseSpec } from "../parser/spec-parser";

/**
 * Selects an endpoint: updates nav, resets playground, and pushes a hash URL.
 *
 * @param ep - The endpoint to activate.
 */
export function selectEndpoint(ep: EndpointEntry) {
  navState.setActivePage(ep, null);
  playgroundState.reset(ep);
  const id = ep.operation.operationId ?? `${ep.method}:${ep.path}`;
  history.replaceState(null, "", `#endpoints/${encodeURIComponent(id)}`);
}

/**
 * Selects a schema: switches the sidebar tab, clears active endpoint, resets playground.
 *
 * @param name - Schema name as it appears in components.schemas.
 */
export function selectSchema(name: string) {
  navState.setSidebarTab("schemas");
  navState.setActivePage(null, name);
  playgroundState.reset(null);
  history.replaceState(null, "", `#schemas/${encodeURIComponent(name)}`);
}

/**
 * Applies a freshly parsed spec: resets all dependent state, then loads the spec last
 * so that the specState subscription fires a single full re-render after everything is ready.
 *
 * @param spec - Parsed OpenAPI document.
 * @param firstServer - First server entry from the spec, used to initialise server state.
 */
export function applySpec(spec: OpenAPISpec, firstServer: Server | undefined) {
  navState.clear();
  playgroundState.reset(null);
  serverState.init(firstServer);
  modalState.close();
  specState.load(spec, parseSpec(spec));
}