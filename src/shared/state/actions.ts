/** Cross-module state operations that mutate more than one store atomically. */
import type {EndpointEntry, OpenAPISpec, Server} from "../../features/spec/openapi";
import {specActions, specSnapshot} from "../../features/spec/spec-context";
import {navActions, navSnapshot} from "../../features/nav/nav-context";
import {initServerVariables, serverActions, serverSnapshot} from "../../features/server/server-context";
import {authSnapshot} from "../../features/auth/auth-context";
import {playgroundActions, playgroundSnapshot} from "../../features/playground/playground-context";
import {modalActions} from "../contexts/modal-context";
import {parseSpec} from "../../features/spec/spec-parser";
import {resolveServerUrl} from "../../features/spec/example-gen";
import {executeRequest, isCorsError} from "../utils/http-client";

// ─── Spec loading ─────────────────────────────────────────────────────────────

/**
 * Fetches and applies an OpenAPI spec from a URL.
 * Sets modal error on failure.
 *
 * @param url - Absolute URL pointing to a JSON or YAML spec.
 */
export async function loadSpecFromUrl(url: string) {
    specActions.setSpecLoading(true);
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const contentType = res.headers.get("content-type") ?? "";
        const text = await res.text();
        await parseAndApplySpec(text, contentType.includes("yaml") || url.endsWith(".yaml") || url.endsWith(".yml"));
    } catch (err) {
        specActions.setLoadError(`Failed to load: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        specActions.setSpecLoading(false);
    }
}

/**
 * Reads and applies an OpenAPI spec from a File object.
 * Sets modal error on failure.
 *
 * @param file - A .json or .yaml/.yml file chosen by the user.
 */
export async function loadSpecFromFile(file: File) {
    try {
        const text = await file.text();
        await parseAndApplySpec(text, file.name.endsWith(".yaml") || file.name.endsWith(".yml"));
    } catch (err) {
        specActions.setLoadError(`Failed to read file: ${err instanceof Error ? err.message : String(err)}`);
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
        specActions.setLoadError(`Failed to parse spec: ${err instanceof Error ? err.message : String(err)}`);
        return;
    }

    if (!parsed.openapi || !parsed.paths) {
        specActions.setLoadError("Invalid OpenAPI spec: missing 'openapi' or 'paths' fields.");
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
        if (name in (specSnapshot.spec?.components?.schemas ?? {})) selectSchema(name);
        return;
    }

    if (hash.startsWith("endpoints/")) {
        const id = hash.slice("endpoints/".length);
        const found = specSnapshot.groups.flatMap(g => g.endpoints).find(ep =>
            ep.operation.operationId ? ep.operation.operationId === id : `${ep.method}:${ep.path}` === id
        );
        if (found && found !== navSnapshot.activeEndpoint) selectEndpoint(found);
    }
}

/**
 * Selects an endpoint: updates nav, resets playground, and pushes a hash URL.
 *
 * @param ep - The endpoint to activate.
 */
export function selectEndpoint(ep: EndpointEntry) {
    navActions.setActiveEndpoint(ep);
    navActions.setActiveSchema(null);
    playgroundActions.reset(ep);
    const id = ep.operation.operationId ?? `${ep.method}:${ep.path}`;
    history.replaceState(null, "", `#endpoints/${encodeURIComponent(id)}`);
}

/**
 * Selects a schema: clears active endpoint, resets playground.
 *
 * @param name - Schema name as it appears in components.schemas.
 */
export function selectSchema(name: string) {
    navActions.setActiveEndpoint(null);
    navActions.setActiveSchema(name);
    playgroundActions.reset(null);
    history.replaceState(null, "", `#schemas/${encodeURIComponent(name)}`);
}

/**
 * Applies a freshly parsed spec: resets all dependent state, then loads the spec.
 *
 * @param spec - Parsed OpenAPI document.
 * @param firstServer - First server entry from the spec, used to initialise server state.
 */
export function applySpec(spec: OpenAPISpec, firstServer: Server | undefined) {
    navActions.setSearchQuery("");
    navActions.setActiveEndpoint(null);
    navActions.setActiveSchema(null);
    playgroundActions.reset(null);
    serverActions.setSelectedServer(firstServer?.url ?? "");
    serverActions.setServerVariables(initServerVariables(firstServer));
    serverActions.setServerPopoverSource(null);
    modalActions.setModalVisible(false);
    specActions.setLoadError("");
    specActions.setSpec(spec);
    specActions.setGroups(parseSpec(spec));
}

/**
 * Executes the current playground request and writes the response back to playground state.
 * Shared between the Send button in Playground and the ⌘Enter keyboard shortcut in App.
 */
export async function executePlayground() {
    if (!playgroundSnapshot.endpoint || playgroundSnapshot.loading) return;
    playgroundActions.setLoading(true);
    playgroundActions.setResponse(null);
    const servers = specSnapshot.spec?.servers ?? [];
    const active = servers.find(s => s.url === serverSnapshot.selectedServer) ?? servers[0];
    const baseUrl = active ? resolveServerUrl(active, serverSnapshot.serverVariables) : window.location.origin;
    try {
        const response = await executeRequest(
            playgroundSnapshot.endpoint,
            playgroundSnapshot.paramValues,
            playgroundSnapshot.bodyValue,
            baseUrl,
            specSnapshot.spec?.components,
            authSnapshot.authValues,
            playgroundSnapshot.bodyParams,
            playgroundSnapshot.fileValues,
        );
        playgroundActions.setResponse(response);
    } catch (err) {
        playgroundActions.setResponse({
            status: 0,
            statusText: isCorsError(err)
                ? "CORS error — request blocked by browser"
                : String(err instanceof Error ? err.message : err),
            headers: {},
            body: isCorsError(err) ? "The request was blocked by CORS policy." : "",
            duration: 0,
        });
    } finally {
        playgroundActions.setLoading(false);
    }
}
