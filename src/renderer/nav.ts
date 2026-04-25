import type { TagGroup, EndpointEntry, HttpMethod, Schema } from "../types/openapi";

// ─── Method badge colors (Tailwind classes) ───────────────────────────────────

const METHOD_CLASSES: Record<HttpMethod | string, { bg: string; text: string }> = {
  get:     { bg: "bg-blue-50",   text: "text-blue-700" },
  post:    { bg: "bg-green-50",  text: "text-green-700" },
  put:     { bg: "bg-amber-50",  text: "text-amber-700" },
  delete:  { bg: "bg-red-50",    text: "text-red-700" },
  patch:   { bg: "bg-pink-50",   text: "text-pink-700" },
  options: { bg: "bg-gray-100",  text: "text-gray-600" },
  head:    { bg: "bg-gray-100",  text: "text-gray-600" },
};

export function methodBadgeClasses(method: string): string {
  const c = METHOD_CLASSES[method.toLowerCase()] ?? METHOD_CLASSES.get;
  return `${c.bg} ${c.text}`;
}

// ─── Nav sidebar HTML ─────────────────────────────────────────────────────────

export function renderNav(
  groups: TagGroup[],
  activeEndpoint: EndpointEntry | null,
  searchQuery = "",
  activeTab: "endpoints" | "schemas" = "endpoints",
  schemas: Record<string, Schema> = {},
  activeSchema: string | null = null
): string {
  const tabs = `
    <div class="flex border-b border-gray-100 shrink-0">
      ${renderTab("endpoints", "Endpoints", activeTab)}
      ${renderTab("schemas", "Schemas", activeTab)}
    </div>`;

  if (activeTab === "schemas") {
    return tabs + renderSchemasPane(schemas, activeSchema);
  }

  const searchBar = `
    <div class="px-3 py-2.5 border-b border-gray-100 shrink-0">
      <div class="relative">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          id="search-input"
          type="text"
          value="${escapeAttr(searchQuery)}"
          autocomplete="off"
          placeholder="Filter endpoints…"
          class="w-full pl-7 pr-6 py-1.5 text-[11px] border border-gray-200 rounded-md bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors"
        />
        ${searchQuery ? `<button id="search-clear" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 leading-none text-sm">×</button>` : ""}
      </div>
    </div>`;

  const groupsHtml = groups.length
    ? groups.map((group) => {
      const items = group.endpoints.map((ep) => renderNavItem(ep, activeEndpoint)).join("");
      return `
        <div class="nav-group" data-tag="${escapeAttr(group.name)}">
          <button
            class="nav-tag-toggle w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
            aria-expanded="true"
          >
            <span>${escapeHtml(group.name)}</span>
            <svg class="nav-tag-chevron w-3 h-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="nav-tag-list">${items}</div>
        </div>`;
      }).join("")
    : `<div class="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center gap-2">
        <p class="text-[11px] text-gray-400">No endpoints match</p>
       </div>`;

  return tabs + searchBar + groupsHtml;
}

function renderTab(id: "endpoints" | "schemas", label: string, active: "endpoints" | "schemas"): string {
  const isActive = id === active;
  return `
    <button
      class="sidebar-tab flex-1 py-2 text-[11px] font-medium transition-colors border-b-2 ${
        isActive
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-400 hover:text-gray-600"
      }"
      data-tab="${id}"
    >${label}</button>`;
}

function renderSchemasPane(schemas: Record<string, Schema>, activeSchema: string | null): string {
  const names = Object.keys(schemas);
  if (!names.length) {
    return `<div class="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center">
      <p class="text-[11px] text-gray-400">No schemas defined</p>
    </div>`;
  }
  const items = names.map((name) => {
    const schema = schemas[name];
    const typeLabel = schema.type ?? (schema.properties ? "object" : schema.items ? "array" : "");
    const isActive = name === activeSchema;
    return `
      <button
        class="nav-schema w-full text-left px-3 py-2 border-b border-gray-50 transition-colors ${isActive ? "bg-gray-100" : "hover:bg-gray-50"}"
        data-name="${escapeAttr(name)}"
      >
        <div class="flex items-center gap-2">
          <span class="shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded bg-purple-50 text-purple-700 uppercase">${escapeHtml(typeLabel || "obj")}</span>
          <span class="truncate text-[11px] font-mono ${isActive ? "text-gray-900" : "text-gray-700"}">${escapeHtml(name)}</span>
        </div>
        ${schema.description ? `<p class="mt-0.5 text-[10px] text-gray-400 truncate pl-[38px]">${escapeHtml(schema.description)}</p>` : ""}
      </button>`;
  }).join("");

  return `<div class="overflow-y-auto flex-1">${items}</div>`;
}

function renderNavItem(ep: EndpointEntry, active: EndpointEntry | null): string {
  const isActive = active?.path === ep.path && active?.method === ep.method;
  const activeClass = isActive
    ? "bg-gray-100 text-gray-900"
    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800";

  return `
    <button
      class="nav-endpoint w-full flex items-center gap-2 px-3 py-[6px] text-left transition-colors ${activeClass}"
      data-path="${escapeAttr(ep.path)}"
      data-method="${escapeAttr(ep.method)}"
      title="${escapeAttr(ep.operation.summary ?? ep.path)}"
    >
      <span class="method-badge shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded ${methodBadgeClasses(ep.method)} uppercase w-[36px] text-center">
        ${ep.method}
      </span>
      <span class="truncate text-[11px] font-mono">${escapeHtml(ep.path)}</span>
    </button>`;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeAttr(str: string): string {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
