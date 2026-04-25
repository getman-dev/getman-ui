import type { OpenAPISpec, AuthValues } from "../types/openapi";
import { escapeHtml, escapeAttr } from "../renderer/nav";

export function renderTopBar(spec: OpenAPISpec, authValues: AuthValues): string {
  const info = spec.info;
  const servers = spec.servers ?? [];
  const hasAuth = !!spec.components?.securitySchemes;
  const isAuthorized = hasAuth && Object.values(authValues).some((v) => v.value || v.username);
  const monogram = info.title.trim().charAt(0).toUpperCase();

  return `
    <header class="flex items-center gap-3 px-4 h-14 border-b border-gray-100 bg-white shrink-0 z-10">

      <!-- API identity: monogram + name + version + description -->
      <div class="flex items-center gap-2.5 shrink-0 min-w-0">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
          <span class="text-[11px] font-bold text-white leading-none">${escapeHtml(monogram)}</span>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-semibold text-gray-900 truncate max-w-[180px]">${escapeHtml(info.title)}</span>
            <span class="text-[10px] text-gray-400 border border-gray-200 rounded-full px-1.5 py-px font-mono shrink-0 leading-tight">${escapeHtml(info.version)}</span>
          </div>
          ${info.description
            ? `<p class="text-[10px] text-gray-400 truncate max-w-[220px] leading-tight mt-px" title="${escapeAttr(info.description)}">${escapeHtml(info.description)}</p>`
            : ""}
        </div>
      </div>

      <!-- Divider -->
      <div class="w-px h-5 bg-gray-200 shrink-0 mx-1"></div>

      <!-- Server indicator -->
      ${servers.length > 0 ? `
        <div class="flex items-center gap-1.5 min-w-0">
          <svg class="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
          </svg>
          ${servers.length > 1
            ? `<select id="server-select"
                class="text-[11px] border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white font-mono max-w-[220px] cursor-pointer">
                ${servers.map((s) => `<option value="${escapeAttr(s.url)}">${escapeHtml(s.description ? `${s.description} (${s.url})` : s.url)}</option>`).join("")}
              </select>`
            : `<code class="text-[11px] text-gray-500 font-mono truncate max-w-[220px]">${escapeHtml(servers[0].url)}</code>`}
        </div>` : ""}

      <div class="flex-1"></div>

      <!-- Actions -->
      <div class="flex items-center gap-2 shrink-0">

        <!-- Auth button -->
        ${hasAuth ? `
          <button id="auth-btn" title="${isAuthorized ? "Manage authorization" : "Set up authorization"}"
            class="flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0
              ${isAuthorized
                ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                : "text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"}">
            ${isAuthorized
              ? `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                 </svg>
                 <span>Authorized</span>
                 <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>`
              : `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                 </svg>
                 <span>Authorize</span>`}
          </button>` : ""}

        <!-- Keyboard shortcuts hint -->
        <button id="shortcuts-btn" title="Keyboard shortcuts"
          class="flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 4h18M7 15h.01M12 15h.01M17 15h.01M7 11h.01M12 11h.01M17 11h.01"/>
          </svg>
          Shortcuts
        </button>

        <!-- Load spec — primary CTA -->
        <button id="load-spec-btn"
          class="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md px-3 py-1.5 font-medium transition-colors shrink-0 shadow-sm">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          Load spec
          <kbd class="ml-0.5 text-[9px] opacity-60 font-mono">⌘K</kbd>
        </button>
      </div>
    </header>`;
}