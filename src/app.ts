/**
 * Application bootstrap: wires state store subscriptions, owns render orchestration,
 * and handles event binding, spec loading, hash routing, and keyboard shortcuts.
 */
import type { OpenAPISpec, TagGroup } from "./types/openapi";
import { resolveParameter } from "./parser/ref-resolver";
import { buildUrl, resolveServerUrl } from "./parser/example-gen";
import { renderNav, bindNavEvents } from "./components/nav";
import { renderEndpointDetail, renderDetailEmpty, bindDetailEvents } from "./pages/endpoint-detail";
import { renderSchemaDetail } from "./pages/schema-detail";
import { renderPlayground, bindPlaygroundEvents } from "./components/playground";
import { renderTopBar, bindTopBarEvents } from "./components/top-bar";
import { renderLoadModal, bindModalEvents } from "./components/load-modal";
import { renderAuthModal, bindAuthModalEvents } from "./components/auth-modal";
import { executeRequest, isCorsError } from "./utils/http-client";
import { specState } from "./state/spec-state";
import { navState } from "./state/nav-state";
import { serverState } from "./state/server-state";
import { authState } from "./state/auth-state";
import { playgroundState } from "./state/playground-state";
import { modalState } from "./state/modal-state";
import { applySpec } from "./state/actions";

// ─── Public interface ─────────────────────────────────────────────────────────

export interface AppController {
  loadUrl(url: string): Promise<void>;
  destroy(): void;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createApp(root: HTMLElement, initialUrl?: string): AppController {
  const $  = <T extends HTMLElement>(sel: string): T => root.querySelector<T>(sel)!;
  const $$ = <T extends HTMLElement>(sel: string): NodeListOf<T> => root.querySelectorAll<T>(sel);

  const $topBar    = () => root.querySelector<HTMLElement>("#top-bar");
  const $nav       = () => root.querySelector<HTMLElement>("#nav-pane");
  const $detail    = () => root.querySelector<HTMLElement>("#detail-pane");
  const $tryIt     = () => root.querySelector<HTMLElement>("#try-pane");
  const $modal     = () => root.querySelector<HTMLElement>("#modal-container");
  const $authModal = () => root.querySelector<HTMLElement>("#auth-modal-container");

  // ─── Render passes ───────────────────────────────────────────────────────

  function renderAll() {
    if (!specState.spec) return;
    renderTopBarPane();
    renderNavPane();
    renderDetailPane();
    renderTryItPane();
    renderModalPane();
    renderAuthModalPane();
  }

  function renderTopBarPane() {
    const el = $topBar();
    if (!el || !specState.spec) return;
    el.innerHTML = renderTopBar(
      specState.spec,
      authState.authValues,
      serverState.selectedServer,
      serverState.serverVariables,
      serverState.serverPopoverSource,
    );
    bindTopBarEvents(root);
  }

  function renderNavPane() {
    const el = $nav();
    if (!el) return;
    const filtered = filterGroups(specState.groups, navState.searchQuery);
    const schemas = specState.spec?.components?.schemas ?? {};
    el.innerHTML = renderNav(
      filtered,
      navState.activeEndpoint,
      navState.searchQuery,
      navState.sidebarTab,
      schemas,
      navState.activeSchema,
    );
    bindNavEvents(root);
  }

  function renderDetailPane() {
    const el = $detail();
    if (!el) return;
    if (!specState.spec) {
      el.innerHTML = renderDetailEmpty();
      return;
    }
    if (navState.activeSchema) {
      const schema = specState.spec.components?.schemas?.[navState.activeSchema];
      if (schema) {
        el.innerHTML = renderSchemaDetail(navState.activeSchema, schema, specState.spec.components);
        bindDetailEvents(root);
        return;
      }
    }
    if (!navState.activeEndpoint) {
      el.innerHTML = renderDetailEmpty();
    } else {
      el.innerHTML = renderEndpointDetail(navState.activeEndpoint, specState.spec.components);
      bindDetailEvents(root);
    }
  }

  function renderTryItPane() {
    const el = $tryIt();
    if (!el || !specState.spec) return;
    el.innerHTML = renderPlayground(
      playgroundState.snapshot(),
      specState.spec,
      authState.authValues,
      serverState.selectedServer,
      serverState.serverVariables,
      serverState.serverPopoverSource,
    );
    bindPlaygroundEvents(root, handleExecute, updateUrlPreview);
  }

  function renderModalPane() {
    const el = $modal();
    if (!el) return;
    if (modalState.shortcutsVisible) {
      el.innerHTML = renderShortcutsOverlay();
      bindShortcutsOverlayEvents();
    } else {
      el.innerHTML = renderLoadModal(modalState.modalVisible, modalState.modalUrlValue, modalState.modalError);
      bindModalEvents(root, loadSpecFromUrl, loadSpecFromFile);
    }
  }

  function renderAuthModalPane() {
    const el = $authModal();
    if (!el) return;
    const schemes = specState.spec?.components?.securitySchemes ?? {};
    el.innerHTML = renderAuthModal(authState.authModalVisible, schemes, authState.authValues);
    bindAuthModalEvents(root);
  }

  function applyPageLayout() {
    const tryPane = $tryIt();
    const handleRight = root.querySelector<HTMLElement>("#handle-right");
    const show = !!navState.activeEndpoint;
    if (tryPane) tryPane.style.display = show ? "" : "none";
    if (handleRight) handleRight.style.display = show ? "" : "none";
  }

  // ─── Subscriptions ───────────────────────────────────────────────────────

  function wireSubscriptions() {
    specState.sub(renderAll);

    navState.sub(renderNavPane);
    navState.sub(renderDetailPane);
    navState.sub(applyPageLayout);

    serverState.sub(renderTopBarPane);
    serverState.sub(renderTryItPane);
    serverState.sub(updateUrlPreview);

    authState.sub(renderAuthModalPane);
    authState.sub(renderTopBarPane);
    authState.sub(renderTryItPane);

    playgroundState.sub(renderTryItPane);

    modalState.sub(renderModalPane);
  }

  // ─── Filtering ───────────────────────────────────────────────────────────

  function filterGroups(groups: TagGroup[], query: string): TagGroup[] {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        endpoints: g.endpoints.filter(
          (ep) =>
            ep.path.toLowerCase().includes(q) ||
            ep.method.toLowerCase().includes(q) ||
            ep.operation.summary?.toLowerCase().includes(q) ||
            ep.operation.operationId?.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.endpoints.length > 0);
  }

  // ─── Shortcuts overlay events (no dedicated component file) ─────────────────

  function bindShortcutsOverlayEvents() {
    $<HTMLElement>("#shortcuts-close")?.addEventListener("click", () => modalState.closeShortcuts());
    $<HTMLElement>("#shortcuts-backdrop")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) modalState.closeShortcuts();
    });
  }

  // ─── URL preview ──────────────────────────────────────────────────────────

  function resolvedBaseUrl(): string {
    const servers = specState.spec?.servers ?? [];
    const server = servers.find(s => s.url === serverState.selectedServer) ?? servers[0];
    if (!server) return serverState.selectedServer || "http://localhost";
    return resolveServerUrl(server, serverState.serverVariables);
  }

  function updateUrlPreview() {
    if (!specState.spec || !playgroundState.endpoint) return;
    const params = (playgroundState.endpoint.operation.parameters ?? []).map((p) =>
      resolveParameter(p, specState.spec!.components)
    );
    const url = buildUrl(resolvedBaseUrl(), playgroundState.endpoint.path, playgroundState.paramValues, params);
    const preview = root.querySelector<HTMLElement>("#try-url-preview");
    if (preview) preview.textContent = url;
  }

  // ─── Request execution ────────────────────────────────────────────────────

  async function handleExecute() {
    if (!specState.spec || !playgroundState.endpoint) return;
    playgroundState.startLoading();
    try {
      const response = await executeRequest(
        playgroundState.endpoint,
        playgroundState.paramValues,
        playgroundState.bodyValue,
        resolvedBaseUrl(),
        specState.spec.components,
        authState.authValues,
        playgroundState.bodyParams,
        playgroundState.fileValues,
      );
      playgroundState.setResponse(response);
    } catch (err) {
      playgroundState.setResponse({
        status: 0,
        statusText: isCorsError(err)
          ? "CORS error — request blocked by browser"
          : String(err instanceof Error ? err.message : err),
        headers: {},
        body: isCorsError(err) ? "The request was blocked by CORS policy." : "",
        duration: 0,
      });
    }
  }

  // ─── Spec loading ─────────────────────────────────────────────────────────

  async function loadSpecFromUrl(url: string) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const contentType = res.headers.get("content-type") ?? "";
      const text = await res.text();
      await parseAndApplySpec(text, contentType.includes("yaml") || url.endsWith(".yaml") || url.endsWith(".yml"));
    } catch (err) {
      modalState.setError(`Failed to load: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function loadSpecFromFile(file: File) {
    try {
      const text = await file.text();
      await parseAndApplySpec(text, file.name.endsWith(".yaml") || file.name.endsWith(".yml"));
    } catch (err) {
      modalState.setError(`Failed to read file: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function parseAndApplySpec(text: string, isYaml: boolean) {
    let parsed: OpenAPISpec;
    try {
      if (isYaml) {
        const jsYaml = await import("js-yaml");
        parsed = jsYaml.load(text) as OpenAPISpec;
      } else {
        parsed = JSON.parse(text);
      }
    } catch (err) {
      modalState.setError(`Failed to parse spec: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }

    if (!parsed.openapi || !parsed.paths) {
      modalState.setError("Invalid OpenAPI spec: missing 'openapi' or 'paths' fields.");
      return;
    }

    applySpec(parsed, parsed.servers?.[0]);
    restoreFromHash();
    applyPageLayout();
  }

  // ─── Hash routing ─────────────────────────────────────────────────────────

  function restoreFromHash() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;

    if (hash.startsWith("schemas/")) {
      const schemaName = hash.slice("schemas/".length);
      if (!(schemaName in (specState.spec?.components?.schemas ?? {}))) return;
      navState.setSidebarTab("schemas");
      navState.setActivePage(null, schemaName);
      playgroundState.reset(null);
      return;
    }

    if (hash.startsWith("endpoints/")) {
      const id = hash.slice("endpoints/".length);
      const found = specState.groups.flatMap((g) => g.endpoints).find((ep) =>
        ep.operation.operationId ? ep.operation.operationId === id : `${ep.method}:${ep.path}` === id
      );
      if (!found || found === navState.activeEndpoint) return;
      navState.setActivePage(found, null);
      playgroundState.reset(found);
    }
  }

  // ─── Keyboard shortcuts overlay ───────────────────────────────────────────

  function renderShortcutsOverlay(): string {
    const rows: [string, string][] = [
      ["/",     "Focus search"],
      ["↑ ↓",  "Navigate endpoints"],
      ["Enter", "Select endpoint"],
      ["Esc",   "Close / dismiss"],
      ["⌘ K",  "Load spec"],
      ["⌘ ↵",  "Execute request"],
      ["?",     "Toggle this panel"],
    ];
    const rowsHtml = rows.map(([key, desc]) => `
      <div class="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
        <span class="text-xs text-gray-600 dark:text-gray-300">${desc}</span>
        <kbd class="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 shrink-0">${key}</kbd>
      </div>`).join("");
    return `
      <div id="shortcuts-backdrop" class="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-72 mx-4 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
            <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">Keyboard shortcuts</span>
            <button id="shortcuts-close" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none transition-colors">×</button>
          </div>
          <div class="px-5 py-2">${rowsHtml}</div>
        </div>
      </div>`;
  }

  // ─── Keyboard navigation ──────────────────────────────────────────────────

  function navigateNav(dir: "up" | "down") {
    const buttons = Array.from($$<HTMLButtonElement>(".nav-endpoint"));
    if (!buttons.length) return;
    const focused = root.querySelector<HTMLButtonElement>(".nav-endpoint:focus");
    const idx = focused ? buttons.indexOf(focused) : -1;
    const next = dir === "down"
      ? (idx + 1) % buttons.length
      : (idx - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
    buttons[next]?.scrollIntoView({ block: "nearest" });
  }

  function onKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const inInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
    const isMeta = e.metaKey || e.ctrlKey;

    if (isMeta && e.key === "Enter") {
      if (playgroundState.endpoint && !playgroundState.loading) { e.preventDefault(); handleExecute(); }
      return;
    }
    if (isMeta && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      modalState.open();
      return;
    }

    if (e.key === "Escape") {
      if (modalState.shortcutsVisible) { modalState.closeShortcuts(); return; }
      if (modalState.modalVisible)     { modalState.close(); return; }
      if (authState.authModalVisible)  { authState.closeModal(); return; }
      if (root.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (inInput && target.id !== "search-input") return;
      e.preventDefault();
      navigateNav(e.key === "ArrowDown" ? "down" : "up");
      return;
    }

    if (inInput) return;

    if (e.key === "/") {
      e.preventDefault();
      const search = $<HTMLInputElement>("#search-input");
      search?.focus(); search?.select();
      return;
    }

    if (e.key === "?") { e.preventDefault(); modalState.toggleShortcuts(); }
  }

  // ─── Dark mode ────────────────────────────────────────────────────────────

  const DARK_KEY = "api-explorer-dark";
  const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  let darkMode = localStorage.getItem(DARK_KEY) !== null
    ? localStorage.getItem(DARK_KEY) === "true"
    : systemDark;

  function applyDark(on: boolean) {
    darkMode = on;
    root.classList.toggle("dark", on);
    try { localStorage.setItem(DARK_KEY, String(on)); } catch { /* ignore */ }
  }

  applyDark(darkMode);

  // ─── Bootstrap ────────────────────────────────────────────────────────────

  wireSubscriptions();

  const onHashChange = () => restoreFromHash();
  window.addEventListener("hashchange", onHashChange);
  document.addEventListener("keydown", onKeyDown);

  renderModalPane();
  $<HTMLElement>("#load-spec-btn-initial")?.addEventListener("click", () => modalState.open());
  root.addEventListener("click", (e) => {
    const target = e.target as Element;
    if (target.closest("#shortcuts-btn")) modalState.openShortcuts();
    if (target.closest("#dark-toggle-btn")) applyDark(!darkMode);
  });

  if (initialUrl) loadSpecFromUrl(initialUrl);

  return {
    loadUrl: loadSpecFromUrl,
    destroy() {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("keydown", onKeyDown);
    },
  };
}