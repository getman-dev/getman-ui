import type { AppController } from "./app";
import { createApp } from "./app";
import { initResizablePanes } from "./utils/resizable-panes";

const TEMPLATE = /* html */ `
<div class="flex flex-col h-full overflow-hidden" style="font-family:'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif">

  <div id="modal-container"></div>
  <div id="auth-modal-container"></div>

  <div id="top-bar">
    <header class="flex items-center gap-3 px-4 h-14 border-b border-gray-100 bg-white shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <span class="text-sm font-semibold text-gray-400">API Explorer</span>
      </div>
      <div class="flex-1"></div>
      <button
        id="load-spec-btn-initial"
        class="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-3 py-1.5 rounded-md font-medium transition-colors shadow-sm"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        Load OpenAPI spec
      </button>
    </header>
  </div>

  <div id="pane-container" class="flex flex-1 min-h-0 overflow-hidden">

    <aside id="nav-pane" class="shrink-0 bg-gray-50 overflow-y-auto flex flex-col">
      <div class="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center gap-2">
        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <p class="text-[11px] text-gray-400">No spec loaded</p>
      </div>
    </aside>

    <div id="handle-left" class="pane-handle" aria-hidden="true">
      <div class="pane-handle-line"></div>
    </div>

    <main id="detail-pane" class="flex-1 min-w-0 bg-white overflow-hidden">
      <div class="h-full flex flex-col items-center justify-center text-center px-8 gap-3">
        <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Load an OpenAPI spec to get started</p>
          <p class="text-xs text-gray-400">Supports JSON and YAML · OpenAPI 3.0 and 3.1</p>
        </div>
      </div>
    </main>

    <div id="handle-right" class="pane-handle" aria-hidden="true">
      <div class="pane-handle-line"></div>
    </div>

    <aside id="try-pane" class="shrink-0 bg-white overflow-hidden">
      <div class="h-full flex flex-col items-center justify-center text-center px-5 gap-2">
        <p class="text-xs text-gray-400">Try-it panel</p>
      </div>
    </aside>

  </div>
</div>
`;

export class ApiExplorerElement extends HTMLElement {
  static observedAttributes = ["url"];
  private _app: AppController | null = null;

  connectedCallback() {
    // Default sizing so the element fills its container out-of-the-box
    if (!this.style.display) this.style.display = "block";
    if (!this.style.height) this.style.height = "100%";

    this.innerHTML = TEMPLATE;
    initResizablePanes(this);

    // url attr → explicit attribute → ?url= query param → undefined (show empty state)
    const url =
      this.getAttribute("url") ??
      new URLSearchParams(location.search).get("url") ??
      undefined;

    this._app = createApp(this, url);
  }

  disconnectedCallback() {
    this._app?.destroy();
    this._app = null;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === "url" && newValue !== oldValue && this.isConnected && this._app) {
      this._app.loadUrl(newValue!);
    }
  }
}