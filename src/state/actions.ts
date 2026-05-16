/** Cross-module state operations that mutate more than one store atomically. */
import type { EndpointEntry, OpenAPISpec, Server } from "../types/openapi";
import { specState } from "./spec-state.svelte.ts";
import { navState } from "./nav-state.svelte.ts";
import { serverState, initServerVariables } from "./server-state.svelte.ts";
import { authState } from "./auth-state.svelte.ts";
import { playgroundState } from "./playground-state.svelte.ts";
import { modalState } from "./modal-state.svelte.ts";
import { parseSpec } from "../parser/spec-parser";
import { resolveServerUrl } from "../parser/example-gen";
import { executeRequest, isCorsError } from "../utils/http-client";

// ─── Spec loading ─────────────────────────────────────────────────────────────

/**
 * Fetches and applies an OpenAPI spec from a URL.
 * Sets modalState.modalError on failure.
 *
 * @param url - Absolute URL pointing to a JSON or YAML spec.
 */
export async function loadSpecFromUrl(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text();
    await parseAndApplySpec(text, contentType.includes("yaml") || url.endsWith(".yaml") || url.endsWith(".yml"));
  } catch (err) {
    modalState.modalError = `Failed to load: ${err instanceof Error ? err.message : String(err)}`;
  }
}

/**
 * Reads and applies an OpenAPI spec from a File object.
 * Sets modalState.modalError on failure.
 *
 * @param file - A .json or .yaml/.yml file chosen by the user.
 */
export async function loadSpecFromFile(file: File) {
  try {
    const text = await file.text();
    await parseAndApplySpec(text, file.name.endsWith(".yaml") || file.name.endsWith(".yml"));
  } catch (err) {
    modalState.modalError = `Failed to read file: ${err instanceof Error ? err.message : String(err)}`;
  }
}

async function parseAndApplySpec(text: string, isYaml: boolean) {
  let parsed: OpenAPISpec;
  try {
    if (isYaml) {
      const jsYaml = await import("js-yaml");
      parsed = jsYaml.load(text) as OpenAPISpec;
    } else {
      parsed = JSON.parse(text) as OpenAPISpec;
    }
  } catch (err) {
    modalState.modalError = `Failed to parse spec: ${err instanceof Error ? err.message : String(err)}`;
    return;
  }

  if (!parsed.openapi || !parsed.paths) {
    modalState.modalError = "Invalid OpenAPI spec: missing 'openapi' or 'paths' fields.";
    return;
  }

  applySpec(parsed, parsed.servers?.[0]);
  restoreFromHash();
}

/**
 * Restores the active endpoint or schema from the current URL hash.
 * Called after a spec is loaded and on hashchange events.
 */
export function restoreFromHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (!hash) return;

  if (hash.startsWith("schemas/")) {
    const name = hash.slice("schemas/".length);
    if (name in (specState.spec?.components?.schemas ?? {})) selectSchema(name);
    return;
  }

  if (hash.startsWith("endpoints/")) {
    const id = hash.slice("endpoints/".length);
    const found = specState.groups.flatMap(g => g.endpoints).find(ep =>
      ep.operation.operationId ? ep.operation.operationId === id : `${ep.method}:${ep.path}` === id
    );
    if (found && found !== navState.activeEndpoint) selectEndpoint(found);
  }
}

/**
 * Selects an endpoint: updates nav, resets playground, and pushes a hash URL.
 *
 * @param ep - The endpoint to activate.
 */
export function selectEndpoint(ep: EndpointEntry) {
  navState.activeEndpoint = ep;
  navState.activeSchema = null;
  resetPlayground(ep);
  const id = ep.operation.operationId ?? `${ep.method}:${ep.path}`;
  history.replaceState(null, "", `#endpoints/${encodeURIComponent(id)}`);
}

/**
 * Selects a schema: switches the sidebar tab, clears active endpoint, resets playground.
 *
 * @param name - Schema name as it appears in components.schemas.
 */
export function selectSchema(name: string) {
  navState.sidebarTab = "schemas";
  navState.activeEndpoint = null;
  navState.activeSchema = name;
  resetPlayground(null);
  history.replaceState(null, "", `#schemas/${encodeURIComponent(name)}`);
}

/**
 * Applies a freshly parsed spec: resets all dependent state, then loads the spec.
 *
 * @param spec - Parsed OpenAPI document.
 * @param firstServer - First server entry from the spec, used to initialise server state.
 */
export function applySpec(spec: OpenAPISpec, firstServer: Server | undefined) {
  navState.searchQuery = "";
  navState.sidebarTab = "endpoints";
  navState.activeEndpoint = null;
  navState.activeSchema = null;
  resetPlayground(null);
  serverState.selectedServer = firstServer?.url ?? "";
  serverState.serverVariables = initServerVariables(firstServer);
  serverState.serverPopoverSource = null;
  modalState.modalVisible = false;
  modalState.modalError = "";
  specState.spec = spec;
  specState.groups = parseSpec(spec);
}

/**
 * Executes the current playground request and writes the response back to playgroundState.
 * Shared between the Send button in Playground.svelte and the ⌘Enter keyboard shortcut in App.svelte.
 */
export async function executePlayground() {
  if (!playgroundState.endpoint || playgroundState.loading) return;
  playgroundState.loading = true;
  playgroundState.response = null;
  const servers = specState.spec?.servers ?? [{ url: "http://localhost" }];
  const active  = servers.find(s => s.url === serverState.selectedServer) ?? servers[0];
  const baseUrl = active ? resolveServerUrl(active, serverState.serverVariables) : (servers[0]?.url ?? "http://localhost");
  try {
    const response = await executeRequest(
      playgroundState.endpoint,
      playgroundState.paramValues,
      playgroundState.bodyValue,
      baseUrl,
      specState.spec?.components,
      authState.authValues,
      playgroundState.bodyParams,
      playgroundState.fileValues,
    );
    playgroundState.response = response;
  } catch (err) {
    playgroundState.response = {
      status: 0,
      statusText: isCorsError(err)
        ? "CORS error — request blocked by browser"
        : String(err instanceof Error ? err.message : err),
      headers: {},
      body: isCorsError(err) ? "The request was blocked by CORS policy." : "",
      duration: 0,
    };
  } finally {
    playgroundState.loading = false;
  }
}

function resetPlayground(ep: EndpointEntry | null) {
  playgroundState.endpoint = ep;
  playgroundState.paramValues = {};
  playgroundState.bodyValue = "";
  playgroundState.bodyParams = {};
  playgroundState.fileValues = {};
  playgroundState.response = null;
  playgroundState.loading = false;
}