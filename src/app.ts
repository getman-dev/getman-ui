import type {
  OpenAPISpec,
  EndpointEntry,
  TagGroup,
  TryItState,
  AuthValues,
} from "./types/openapi";
import { parseSpec, resolveParameter, buildUrl } from "./parser/spec-parser";
import { renderNav } from "./renderer/nav";
import { renderDetail, renderDetailEmpty, renderSchemaDetail } from "./renderer/detail";
import { renderTryIt } from "./renderer/try-it";
import { renderTopBar } from "./components/top-bar";
import { renderLoadModal } from "./components/load-modal";
import { renderAuthModal } from "./components/auth-modal";
import { executeRequest, isCorsError } from "./utils/http-client";

// ─── Public interface ─────────────────────────────────────────────────────────

export interface AppController {
  loadUrl(url: string): Promise<void>;
  destroy(): void;
}

// ─── App state ────────────────────────────────────────────────────────────────

interface AppState {
  spec: OpenAPISpec | null;
  groups: TagGroup[];
  activeEndpoint: EndpointEntry | null;
  tryIt: TryItState;
  searchQuery: string;
  selectedServer: string;
  modalVisible: boolean;
  modalError: string;
  modalUrlValue: string;
  authValues: AuthValues;
  authModalVisible: boolean;
  sidebarTab: "endpoints" | "schemas";
  activeSchema: string | null;
  shortcutsVisible: boolean;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createApp(root: HTMLElement, initialUrl?: string): AppController {
  const state: AppState = {
    spec: null,
    groups: [],
    activeEndpoint: null,
    tryIt: { endpoint: null, paramValues: {}, bodyValue: "", response: null, loading: false },
    searchQuery: "",
    selectedServer: "",
    modalVisible: false,
    modalError: "",
    modalUrlValue: "",
    authValues: {},
    authModalVisible: false,
    sidebarTab: "endpoints",
    activeSchema: null,
    shortcutsVisible: false,
  };

  // ─── Scoped DOM helpers ───────────────────────────────────────────────────

  const $  = <T extends HTMLElement>(sel: string): T => root.querySelector<T>(sel)!;
  const $$ = <T extends HTMLElement>(sel: string): NodeListOf<T> => root.querySelectorAll<T>(sel);

  const $topBar   = () => $<HTMLElement>("#top-bar");
  const $nav      = () => $<HTMLElement>("#nav-pane");
  const $detail   = () => $<HTMLElement>("#detail-pane");
  const $tryIt    = () => $<HTMLElement>("#try-pane");
  const $modal    = () => $<HTMLElement>("#modal-container");
  const $authModal = () => $<HTMLElement>("#auth-modal-container");

  // ─── Render passes ───────────────────────────────────────────────────────

  function renderAll() {
    if (!state.spec) return;
    renderTopBarPane();
    renderNavPane();
    renderDetailPane();
    renderTryItPane();
    renderModalPane();
    renderAuthModalPane();
  }

  function renderTopBarPane() {
    if (!state.spec) return;
    $topBar().innerHTML = renderTopBar(state.spec, state.authValues);
    bindTopBarEvents();
  }

  function renderNavPane() {
    const filtered = filterGroups(state.groups, state.searchQuery);
    const schemas = state.spec?.components?.schemas ?? {};
    $nav().innerHTML = renderNav(filtered, state.activeEndpoint, state.searchQuery, state.sidebarTab, schemas, state.activeSchema);
    bindNavEvents();
  }

  function renderDetailPane() {
    if (!state.spec) {
      $detail().innerHTML = renderDetailEmpty();
      return;
    }
    if (state.activeSchema) {
      const schema = state.spec.components?.schemas?.[state.activeSchema];
      if (schema) {
        $detail().innerHTML = renderSchemaDetail(state.activeSchema, schema, state.spec.components);
        return;
      }
    }
    if (!state.activeEndpoint) {
      $detail().innerHTML = renderDetailEmpty();
    } else {
      $detail().innerHTML = renderDetail(state.activeEndpoint, state.spec.components);
      bindDetailEvents();
    }
  }

  function renderTryItPane() {
    if (!state.spec) return;
    $tryIt().innerHTML = renderTryIt(state.tryIt, state.spec, state.authValues);
    bindTryItEvents();
  }

  function renderModalPane() {
    if (state.shortcutsVisible) {
      $modal().innerHTML = renderShortcutsOverlay();
      bindShortcutsOverlayEvents();
    } else {
      $modal().innerHTML = renderLoadModal(state.modalVisible, state.modalUrlValue, state.modalError);
      bindModalEvents();
    }
  }

  function renderShortcutsOverlay(): string {
    const rows: [string, string][] = [
      ["/",      "Focus search"],
      ["↑ ↓",   "Navigate endpoints"],
      ["Enter",  "Select endpoint"],
      ["Esc",    "Close / dismiss"],
      ["⌘ K",   "Load spec"],
      ["⌘ ↵",   "Execute request"],
      ["?",      "Toggle this panel"],
    ];
    const rowsHtml = rows.map(([key, desc]) => `
      <div class="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
        <span class="text-xs text-gray-600">${desc}</span>
        <kbd class="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200 shrink-0">${key}</kbd>
      </div>`).join("");
    return `
      <div id="shortcuts-backdrop" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl w-72 mx-4 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <span class="text-sm font-semibold text-gray-800">Keyboard shortcuts</span>
            <button id="shortcuts-close" class="text-gray-400 hover:text-gray-600 text-xl leading-none transition-colors">×</button>
          </div>
          <div class="px-5 py-2">${rowsHtml}</div>
        </div>
      </div>`;
  }

  function bindShortcutsOverlayEvents() {
    const close = () => { state.shortcutsVisible = false; renderModalPane(); };
    $<HTMLElement>("#shortcuts-close")?.addEventListener("click", close);
    $<HTMLElement>("#shortcuts-backdrop")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) close();
    });
  }

  function renderAuthModalPane() {
    const schemes = state.spec?.components?.securitySchemes ?? {};
    $authModal().innerHTML = renderAuthModal(state.authModalVisible, schemes, state.authValues);
    bindAuthModalEvents();
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

  // ─── Event binding ───────────────────────────────────────────────────────

  function bindTopBarEvents() {
    $<HTMLElement>("#load-spec-btn")?.addEventListener("click", () => {
      state.modalVisible = true;
      state.modalError = "";
      renderModalPane();
    });

    $<HTMLElement>("#auth-btn")?.addEventListener("click", () => {
      state.authModalVisible = true;
      renderAuthModalPane();
    });

    $<HTMLSelectElement>("#server-select")?.addEventListener("change", (e) => {
      state.selectedServer = (e.target as HTMLSelectElement).value;
    });
  }

  function bindNavEvents() {
    $$<HTMLButtonElement>(".sidebar-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.sidebarTab = btn.dataset.tab as "endpoints" | "schemas";
        renderNavPane();
      });
    });

    $<HTMLInputElement>("#search-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        state.searchQuery = (e.target as HTMLInputElement).value;
        renderNavPane();
      }
    });
    $<HTMLElement>("#search-clear")?.addEventListener("click", () => {
      state.searchQuery = "";
      renderNavPane();
    });

    $$<HTMLButtonElement>(".nav-schema").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeSchema = btn.dataset.name!;
        state.activeEndpoint = null;
        state.tryIt = { endpoint: null, paramValues: {}, bodyValue: "", response: null, loading: false };
        setSchemaHash(state.activeSchema);
        renderNavPane();
        renderDetailPane();
        applyPageLayout();
      });
    });

    $$<HTMLButtonElement>(".nav-endpoint").forEach((btn) => {
      btn.addEventListener("click", () => {
        const path = btn.dataset.path!;
        const method = btn.dataset.method!;
        const found = state.groups
          .flatMap((g) => g.endpoints)
          .find((ep) => ep.path === path && ep.method === method);

        if (!found) return;
        state.activeEndpoint = found;
        state.activeSchema = null;
        state.tryIt = {
          endpoint: found,
          paramValues: {},
          bodyValue: "",
          response: null,
          loading: false,
        };
        setEndpointHash(found);
        renderNavPane();
        renderDetailPane();
        renderTryItPane();
        applyPageLayout();
      });
    });

    $$<HTMLButtonElement>(".nav-tag-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const list = btn.nextElementSibling as HTMLElement;
        const chevron = btn.querySelector<SVGElement>(".nav-tag-chevron");
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!isOpen));
        list.style.display = isOpen ? "none" : "";
        chevron?.style.setProperty("transform", isOpen ? "rotate(-90deg)" : "");
      });
    });
  }

  function bindDetailEvents() {
    $$<HTMLButtonElement>(".response-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".response-item");
        const body = item?.querySelector<HTMLElement>(".response-body");
        const chevron = btn.querySelector<SVGElement>(".response-chevron");
        if (!body) return;
        const hidden = body.classList.toggle("hidden");
        chevron?.style.setProperty("transform", hidden ? "" : "rotate(180deg)");
      });
    });
  }

  function bindTryItEvents() {
    $$<HTMLInputElement | HTMLSelectElement>(".try-input").forEach((input) => {
      input.addEventListener("input", () => {
        const name = (input as HTMLElement).dataset.name!;
        state.tryIt.paramValues[name] = input.value;
        updateUrlPreview();
      });
    });

    const bodyTextarea = $<HTMLTextAreaElement>("#try-body");
    bodyTextarea?.addEventListener("input", () => {
      state.tryIt.bodyValue = bodyTextarea.value;
    });

    $<HTMLElement>("#try-body-format")?.addEventListener("click", () => {
      if (!bodyTextarea) return;
      try {
        const pretty = JSON.stringify(JSON.parse(bodyTextarea.value), null, 2);
        bodyTextarea.value = pretty;
        state.tryIt.bodyValue = pretty;
      } catch { /* not valid JSON, ignore */ }
    });

    $<HTMLElement>("#try-execute")?.addEventListener("click", handleExecute);

    $<HTMLElement>("#try-copy-btn")?.addEventListener("click", async () => {
      const text = $<HTMLElement>("#try-tab-body")?.querySelector("pre")?.textContent ?? "";
      await navigator.clipboard.writeText(text);
      const btn = $<HTMLElement>("#try-copy-btn");
      if (!btn) return;
      const original = btn.innerHTML;
      btn.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Copied`;
      btn.classList.add("text-green-600");
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove("text-green-600");
      }, 2000);
    });

    $$<HTMLButtonElement>(".try-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        $$<HTMLButtonElement>(".try-tab").forEach((t) => {
          const active = t === tab;
          t.classList.toggle("bg-white", active);
          t.classList.toggle("shadow-sm", active);
          t.classList.toggle("text-gray-700", active);
          t.classList.toggle("border", active);
          t.classList.toggle("border-gray-200", active);
          t.classList.toggle("text-gray-400", !active);
        });
        $<HTMLElement>("#try-tab-body")?.classList.toggle("hidden", target !== "body");
        $<HTMLElement>("#try-tab-headers")?.classList.toggle("hidden", target !== "headers");
      });
    });
  }

  function updateUrlPreview() {
    if (!state.spec || !state.tryIt.endpoint) return;
    const params = (state.tryIt.endpoint.operation.parameters ?? []).map((p) =>
      resolveParameter(p, state.spec!.components)
    );
    const baseUrl = state.selectedServer || state.spec.servers?.[0]?.url || "http://localhost";
    const url = buildUrl(baseUrl, state.tryIt.endpoint.path, state.tryIt.paramValues, params);
    const preview = $<HTMLElement>("#try-url-preview");
    if (preview) preview.textContent = url;
  }

  async function handleExecute() {
    if (!state.spec || !state.tryIt.endpoint) return;

    state.tryIt.loading = true;
    state.tryIt.response = null;
    renderTryItPane();

    try {
      const baseUrl = state.selectedServer || state.spec.servers?.[0]?.url || "http://localhost";
      const response = await executeRequest(
        state.tryIt.endpoint,
        state.tryIt.paramValues,
        state.tryIt.bodyValue,
        baseUrl,
        state.spec.components,
        state.authValues
      );
      state.tryIt.response = response;
    } catch (err) {
      state.tryIt.response = {
        status: 0,
        statusText: isCorsError(err)
          ? "CORS error — request blocked by browser"
          : String(err instanceof Error ? err.message : err),
        headers: {},
        body: isCorsError(err)
          ? "The request was blocked by CORS policy."
          : "",
        duration: 0,
      };
    }

    state.tryIt.loading = false;
    renderTryItPane();
  }

  function bindAuthModalEvents() {
    const close = () => {
      state.authModalVisible = false;
      renderAuthModalPane();
      renderTopBarPane();
      renderTryItPane();
    };

    $<HTMLElement>("#auth-modal-close")?.addEventListener("click", close);
    $<HTMLElement>("#auth-modal-done")?.addEventListener("click", close);
    $<HTMLElement>("#auth-modal-backdrop")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) close();
    });

    $$<HTMLButtonElement>(".auth-authorize-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const schemeName = btn.dataset.scheme!;
        const inputs = $$<HTMLInputElement>(`.auth-input[data-scheme="${CSS.escape(schemeName)}"]`);
        const entry = state.authValues[schemeName] ?? { value: "", username: "", password: "" };
        inputs.forEach((input) => {
          const field = input.dataset.field as "value" | "username" | "password";
          entry[field] = input.value;
        });
        state.authValues[schemeName] = entry;
        renderAuthModalPane();
        renderTopBarPane();
        renderTryItPane();
      });
    });

    $$<HTMLButtonElement>(".auth-logout-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        delete state.authValues[btn.dataset.scheme!];
        renderAuthModalPane();
        renderTopBarPane();
        renderTryItPane();
      });
    });
  }

  function bindModalEvents() {
    $<HTMLElement>("#modal-close")?.addEventListener("click", closeModal);
    $<HTMLElement>("#load-modal-backdrop")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    $<HTMLElement>("#spec-url-load")?.addEventListener("click", async () => {
      const url = ($<HTMLInputElement>("#spec-url-input")).value.trim();
      if (!url) return;
      state.modalUrlValue = url;
      await loadSpecFromUrl(url);
    });

    $<HTMLInputElement>("#spec-file-input")?.addEventListener("change", async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      await loadSpecFromFile(file);
    });

    $<HTMLElement>("#load-petstore")?.addEventListener("click", async () => {
      await loadSpecFromUrl("https://petstore3.swagger.io/api/v3/openapi.json");
    });
  }

  function closeModal() {
    state.modalVisible = false;
    state.modalError = "";
    renderModalPane();
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
      state.modalError = `Failed to load: ${err instanceof Error ? err.message : String(err)}`;
      renderModalPane();
    }
  }

  async function loadSpecFromFile(file: File) {
    try {
      const text = await file.text();
      const isYaml = file.name.endsWith(".yaml") || file.name.endsWith(".yml");
      await parseAndApplySpec(text, isYaml);
    } catch (err) {
      state.modalError = `Failed to read file: ${err instanceof Error ? err.message : String(err)}`;
      renderModalPane();
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
      state.modalError = `Failed to parse spec: ${err instanceof Error ? err.message : String(err)}`;
      renderModalPane();
      return;
    }

    if (!parsed.openapi || !parsed.paths) {
      state.modalError = "Invalid OpenAPI spec: missing 'openapi' or 'paths' fields.";
      renderModalPane();
      return;
    }

    state.spec = parsed;
    state.groups = parseSpec(parsed);
    state.activeEndpoint = null;
    state.activeSchema = null;
    state.tryIt = { endpoint: null, paramValues: {}, bodyValue: "", response: null, loading: false };
    state.selectedServer = parsed.servers?.[0]?.url ?? "";
    state.searchQuery = "";
    state.modalVisible = false;
    state.modalError = "";

    renderAll();
    restoreFromHash();
    applyPageLayout();
  }

  // ─── Page layout ──────────────────────────────────────────────────────────

  function applyPageLayout() {
    const tryPane = $<HTMLElement>("#try-pane");
    const handleRight = $<HTMLElement>("#handle-right");
    const show = !!state.activeEndpoint;
    if (tryPane) tryPane.style.display = show ? "" : "none";
    if (handleRight) handleRight.style.display = show ? "" : "none";
  }

  // ─── Hash-based routing ───────────────────────────────────────────────────

  function setEndpointHash(endpoint: { method: string; path: string; operation: { operationId?: string } }) {
    const id = endpoint.operation.operationId ?? `${endpoint.method}:${endpoint.path}`;
    history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  }

  function setSchemaHash(name: string) {
    history.replaceState(null, "", `#schema:${encodeURIComponent(name)}`);
  }

  function restoreFromHash() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;

    if (hash.startsWith("schema:")) {
      const schemaName = hash.slice("schema:".length);
      const schemas = state.spec?.components?.schemas ?? {};
      if (!(schemaName in schemas)) return;
      state.activeSchema = schemaName;
      state.activeEndpoint = null;
      state.sidebarTab = "schemas";
      state.tryIt = { endpoint: null, paramValues: {}, bodyValue: "", response: null, loading: false };
      renderNavPane();
      renderDetailPane();
      applyPageLayout();
      return;
    }

    const all = state.groups.flatMap((g) => g.endpoints);
    const found = all.find((ep) => {
      if (ep.operation.operationId) return ep.operation.operationId === hash;
      return `${ep.method}:${ep.path}` === hash;
    });
    if (!found || found === state.activeEndpoint) return;

    state.activeEndpoint = found;
    state.activeSchema = null;
    state.tryIt = {
      endpoint: found,
      paramValues: {},
      bodyValue: "",
      response: null,
      loading: false,
    };
    renderNavPane();
    renderDetailPane();
    renderTryItPane();
    applyPageLayout();
  }

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────

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
    const tag = target.tagName;
    const inInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    const isMeta = e.metaKey || e.ctrlKey;

    // ⌘/Ctrl shortcuts — fire even inside inputs
    if (isMeta && e.key === "Enter") {
      if (state.tryIt.endpoint && !state.tryIt.loading) {
        e.preventDefault();
        handleExecute();
      }
      return;
    }
    if (isMeta && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      state.shortcutsVisible = false;
      state.modalVisible = true;
      state.modalError = "";
      renderModalPane();
      return;
    }

    // Escape — dismiss whatever is open
    if (e.key === "Escape") {
      if (state.shortcutsVisible) { state.shortcutsVisible = false; renderModalPane(); return; }
      if (state.modalVisible)     { closeModal(); return; }
      if (state.authModalVisible) {
        state.authModalVisible = false;
        renderAuthModalPane(); renderTopBarPane(); renderTryItPane();
        return;
      }
      if (root.contains(document.activeElement)) {
        (document.activeElement as HTMLElement).blur();
      }
      return;
    }

    // Arrow-key nav — works from anywhere (including search input)
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (inInput && target.id !== "search-input") return;
      e.preventDefault();
      navigateNav(e.key === "ArrowDown" ? "down" : "up");
      return;
    }

    // Single-key shortcuts — skip when typing
    if (inInput) return;

    if (e.key === "/") {
      e.preventDefault();
      const search = $<HTMLInputElement>("#search-input");
      search?.focus();
      search?.select();
      return;
    }

    if (e.key === "?") {
      e.preventDefault();
      state.shortcutsVisible = !state.shortcutsVisible;
      if (state.shortcutsVisible) { state.modalVisible = false; state.authModalVisible = false; }
      renderModalPane();
      return;
    }
  }

  // ─── Bootstrap ────────────────────────────────────────────────────────────

  const onHashChange = () => restoreFromHash();
  window.addEventListener("hashchange", onHashChange);
  document.addEventListener("keydown", onKeyDown);

  renderModalPane();
  $<HTMLElement>("#load-spec-btn-initial")?.addEventListener("click", () => {
    state.modalVisible = true;
    renderModalPane();
  });
  // Delegated click for the shortcuts button — works in both initial and loaded top bar
  root.addEventListener("click", (e) => {
    if ((e.target as Element).closest("#shortcuts-btn")) {
      state.shortcutsVisible = true;
      state.modalVisible = false;
      state.authModalVisible = false;
      renderModalPane();
    }
  });

  if (initialUrl) {
    loadSpecFromUrl(initialUrl);
  }

  return {
    loadUrl: loadSpecFromUrl,
    destroy() {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("keydown", onKeyDown);
    },
  };
}