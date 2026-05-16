import type { EndpointEntry, Parameter, Components, Response } from "../types/openapi";
import { resolveSchema, resolveParameter, resolveResponse } from "../parser/ref-resolver";
import { escapeHtml } from "../utils/html";
import { methodBadgeClasses } from "../utils/badges";
import { renderSchemaViewer, SCHEMA_VIEWER_TAB_CLASSES } from "../components/schema-viewer";

// ─── Status code colors ───────────────────────────────────────────────────────

function statusClass(code: string): string {
  const n = parseInt(code);
  if (n >= 200 && n < 300) return "text-green-600 dark:text-green-400 font-mono font-semibold";
  if (n >= 400 && n < 500) return "text-amber-600 dark:text-amber-400 font-mono font-semibold";
  if (n >= 500) return "text-red-600 dark:text-red-400 font-mono font-semibold";
  return "text-blue-600 dark:text-blue-400 font-mono font-semibold";
}
// ─── Internal helpers ─────────────────────────────────────────────────────────



function renderParameters(params: Parameter[], components: Components | undefined): string {
  if (!params.length) return '<p class="text-xs text-gray-400 italic">No parameters</p>';

  const grouped = {
    path: params.filter((p) => p.in === "path"),
    query: params.filter((p) => p.in === "query"),
    header: params.filter((p) => p.in === "header"),
    cookie: params.filter((p) => p.in === "cookie"),
  };

  return Object.entries(grouped)
    .filter(([, items]) => items.length > 0)
    .map(([location, items]) => `
      <div class="mb-4">
        <h4 class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">${location}</h4>
        <div class="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
          <table class="w-full border-collapse">
            <tbody>
              ${items.map((rawParam) => {
                const param = resolveParameter(rawParam, components);
                const schema = resolveSchema(param.schema, components);
                return `
                  <tr class="border-b border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="px-3 py-2.5 whitespace-nowrap">
                      <span class="font-mono text-[11px] text-gray-800 dark:text-gray-200">${escapeHtml(param.name)}</span>
                      ${param.required ? '<span class="text-red-500 text-[9px] font-semibold ml-1">*</span>' : ""}
                      ${param.deprecated ? '<span class="text-gray-400 dark:text-gray-500 text-[9px] ml-1">deprecated</span>' : ""}
                    </td>
                    <td class="px-3 py-2.5 whitespace-nowrap">
                      <span class="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded px-1.5 py-0.5 font-mono">${schema?.type ?? "string"}</span>
                    </td>
                    <td class="px-3 py-2.5 whitespace-nowrap">
                      ${schema?.minimum !== undefined ? `<span class="text-[10px] font-mono text-gray-400 dark:text-gray-500">min:${schema.minimum}</span>` : ""}
                      ${schema?.maximum !== undefined ? `<span class="text-[10px] font-mono text-gray-400 dark:text-gray-500 ml-1.5">max:${schema.maximum}</span>` : ""}
                    </td>
                    <td class="px-3 py-2.5 w-full text-xs text-gray-500 dark:text-gray-400">${escapeHtml(param.description ?? schema?.description ?? "")}</td>
                  </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>`)
    .join("");
}

function renderRequestBody(endpoint: EndpointEntry, components: Components | undefined): string {
  const rb = endpoint.operation.requestBody;
  if (!rb) return "";

  const jsonContent = rb.content?.["application/json"];
  if (!jsonContent?.schema) return "";

  const example = jsonContent.example !== undefined
    ? JSON.stringify(jsonContent.example, null, 2)
    : jsonContent.examples
      ? JSON.stringify(Object.values(jsonContent.examples)[0]?.value ?? {}, null, 2)
      : null; // let renderSchemaViewer auto-generate it

  const viewer = renderSchemaViewer(jsonContent.schema, components, { example, required: rb.required });
  if (!viewer) return "";

  return `
    <div class="mb-6">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Request body</h3>
      ${rb.description ? `<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">${escapeHtml(rb.description)}</p>` : ""}
      <div class="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
        <div class="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <span class="text-[10px] text-gray-500 dark:text-gray-400 font-mono">application/json</span>
          ${rb.required ? '<span class="text-[9px] text-red-500 font-semibold">required</span>' : ""}
        </div>
        ${viewer}
      </div>
    </div>`;
}

function renderResponses(
  responses: Record<string, Response>,
  components: Components | undefined
): string {
  const entries = Object.entries(responses);
  if (!entries.length) return "";

  return `
    <div class="mb-6">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Responses</h3>
      <div class="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
        ${entries.map(([code, raw]) => {
          const response = resolveResponse(raw, components);
          const content = response.content ?? {};
          const mediaTypeKey = ["application/json", "*/*"].find(k => k in content) ?? Object.keys(content)[0];
          const mediaType = mediaTypeKey ? content[mediaTypeKey] : undefined;

          let example: string | null = null;
          if (mediaType?.example !== undefined) {
            example = JSON.stringify(mediaType.example, null, 2);
          } else if (mediaType?.examples) {
            const first = Object.values(mediaType.examples)[0];
            if (first?.value !== undefined) example = JSON.stringify(first.value, null, 2);
          }

          const viewer = mediaType?.schema
            ? renderSchemaViewer(mediaType.schema, components, { example })
            : "";
          const hasContent = !!viewer;

          return `
            <div class="response-item" data-code="${code}">
              <button class="response-toggle w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left">
                <span class="${statusClass(code)} text-xs">${code}</span>
                <span class="text-xs text-gray-600 dark:text-gray-400 flex-1">${escapeHtml(response.description)}</span>
                ${mediaTypeKey ? `<span class="text-[10px] font-mono text-gray-400 dark:text-gray-500 shrink-0">${escapeHtml(mediaTypeKey)}</span>` : ""}
                ${hasContent ? `
                  <svg class="response-chevron w-3 h-3 text-gray-400 dark:text-gray-500 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>` : ""}
              </button>
              ${hasContent ? `<div class="response-body hidden">${viewer}</div>` : ""}
            </div>`;
        }).join("")}
      </div>
    </div>`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function renderEndpointDetail(endpoint: EndpointEntry, components: Components | undefined): string {
  const op = endpoint.operation;
  const params = (op.parameters ?? []).map((p) => resolveParameter(p, components));

  return `
    <div class="h-full flex flex-col">
      <div class="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <span class="method-badge shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded ${methodBadgeClasses(endpoint.method)} uppercase w-[36px] text-center">${endpoint.method}</span>
        <code class="font-mono text-sm text-gray-800 dark:text-gray-200">${escapeHtml(endpoint.path)}</code>
        ${op.deprecated ? '<span class="ml-auto text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 rounded px-2 py-0.5">deprecated</span>' : ""}
      </div>

      <div class="flex-1 overflow-y-auto px-5 py-4">
        ${op.summary ? `<p class="text-sm text-gray-700 dark:text-gray-200 mb-1 font-medium">${escapeHtml(op.summary)}</p>` : ""}
        ${op.description ? `<p class="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">${escapeHtml(op.description)}</p>` : '<div class="mb-4"></div>'}

        <div class="mb-6">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Parameters</h3>
          ${renderParameters(params, components)}
        </div>

        ${renderRequestBody(endpoint, components)}
        ${renderResponses(op.responses ?? {}, components)}
      </div>
    </div>`;
}

/**
 * Binds interactive events in the detail pane: response accordion toggles and schema viewer tabs.
 *
 * @param root - The component root element used for scoped DOM queries.
 */
export function bindDetailEvents(root: HTMLElement) {
  root.querySelectorAll<HTMLButtonElement>(".response-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = btn.closest(".response-item")?.querySelector<HTMLElement>(".response-body");
      const chevron = btn.querySelector<SVGElement>(".response-chevron");
      if (!body) return;
      const hidden = body.classList.toggle("hidden");
      chevron?.style.setProperty("transform", hidden ? "" : "rotate(180deg)");
    });
  });

  root.querySelectorAll<HTMLButtonElement>(".schema-viewer-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewer = btn.closest(".schema-viewer");
      if (!viewer) return;
      const target = btn.dataset.tab;
      viewer.querySelectorAll<HTMLButtonElement>(".schema-viewer-tab").forEach((t) => {
        t.className = t === btn ? SCHEMA_VIEWER_TAB_CLASSES.active : SCHEMA_VIEWER_TAB_CLASSES.inactive;
      });
      viewer.querySelectorAll<HTMLElement>(".schema-viewer-panel").forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.panel !== target);
      });
    });
  });
}

export function renderDetailEmpty(): string {
  return `
    <div class="h-full flex flex-col items-center justify-center text-center px-8 gap-3">
      <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <p class="text-sm text-gray-400 dark:text-gray-500">Select an endpoint to view documentation</p>
    </div>`;
}