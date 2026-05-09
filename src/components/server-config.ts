/**
 * Reusable server configuration component: a chip showing the resolved URL
 * and a dropdown panel for selecting a server and configuring URL variables.
 * Used in both the top bar and the playground.
 */

import type { Server, ServerVariable } from "../types/openapi";
import { escapeHtml, escapeAttr } from "../utils/html";
import { resolveServerUrl } from "../parser/example-gen";

function renderVariableRow(varName: string, varDef: ServerVariable, currentVal: string): string {
  const baseClass =
    "text-[11px] font-mono border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 " +
    "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full";

  return `
    <div class="flex items-start gap-3">
      <div class="w-24 shrink-0 pt-1.5">
        <p class="text-[11px] font-mono font-medium text-gray-700 dark:text-gray-300">${escapeHtml(varName)}</p>
        ${varDef.description ? `<p class="text-[10px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">${escapeHtml(varDef.description)}</p>` : ""}
      </div>
      ${varDef.enum?.length
        ? `<select class="server-var-select ${baseClass} cursor-pointer" data-variable="${escapeAttr(varName)}">
            ${varDef.enum.map(opt => `<option value="${escapeAttr(opt)}" ${opt === currentVal ? "selected" : ""}>${escapeHtml(opt)}</option>`).join("")}
           </select>`
        : `<input type="text" class="server-var-input ${baseClass}" data-variable="${escapeAttr(varName)}" value="${escapeAttr(currentVal)}" />`}
    </div>`;
}

/**
 * Renders the server configuration as a centered modal overlay.
 *
 * @param servers - All servers from the spec.
 * @param selectedServer - Template URL of the currently selected server.
 * @param serverVariables - Current values for the selected server's URL variables.
 * @returns HTML string.
 */
export function renderServerPanel(
  servers: Server[],
  selectedServer: string,
  serverVariables: Record<string, string>
): string {
  const activeServer = servers.find(s => s.url === selectedServer) ?? servers[0];
  const varEntries = Object.entries(activeServer?.variables ?? {});
  const resolvedUrl = activeServer ? resolveServerUrl(activeServer, serverVariables) : selectedServer;

  return `
    <div id="server-popover-backdrop" class="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-[60]" style="min-height:100vh">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">

        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
            </svg>
            <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Server</h2>
          </div>
          <button id="server-modal-close" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        ${servers.length > 1 ? `
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <label class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Server</label>
            <select id="server-select" class="w-full text-[11px] font-mono border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer">
              ${servers.map(s => `<option value="${escapeAttr(s.url)}" ${s.url === selectedServer ? "selected" : ""}>${escapeHtml(s.description ?? s.url)}</option>`).join("")}
            </select>
          </div>` : ""}

        ${varEntries.length > 0 ? `
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <label class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Variables</label>
            <div class="flex flex-col gap-3">
              ${varEntries.map(([name, def]) => renderVariableRow(name, def, serverVariables[name] ?? def.default)).join("")}
            </div>
          </div>` : ""}

        <div class="px-5 py-4 bg-gray-50 dark:bg-gray-700/50">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Resolved URL</p>
          <code class="text-[11px] font-mono text-gray-700 dark:text-gray-300 break-all">${escapeHtml(resolvedUrl)}</code>
        </div>

      </div>
    </div>`;
}

/**
 * Renders the server chip button that triggers the config panel.
 *
 * @param resolvedUrl - The fully resolved URL to display.
 * @param isOpen - Whether this chip's panel is currently open.
 * @param id - Element id for event binding.
 * @returns HTML string.
 */
export function renderServerChip(resolvedUrl: string, isOpen: boolean, id: string): string {
  return `
    <button id="${id}" class="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-colors shrink-0
      ${isOpen
        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700"
        : "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"}">
      <svg class="w-3 h-3 shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
      </svg>
      <span class="truncate max-w-[240px]">${escapeHtml(resolvedUrl)}</span>
      <svg class="w-3 h-3 opacity-50 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>`;
}