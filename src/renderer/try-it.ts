import type {
  TryItState,
  OpenAPISpec,
  Parameter,
  AuthValues,
  SecurityScheme,
} from "../types/openapi";
import { resolveParameter, buildUrl, getRequestBodyExample } from "../parser/spec-parser";
import { escapeHtml, escapeAttr, methodBadgeClasses } from "./nav";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function schemeShortLabel(scheme: SecurityScheme): string {
  if (scheme.type === "apiKey") return `API Key (${scheme.in ?? "header"})`;
  if (scheme.type === "http") return `HTTP ${scheme.scheme ?? "bearer"}`;
  if (scheme.type === "oauth2") return "OAuth 2.0";
  if (scheme.type === "openIdConnect") return "OpenID Connect";
  return scheme.type;
}

function getApplicableSchemeNames(
  endpoint: { operation: { security?: { [k: string]: string[] }[] } },
  spec: OpenAPISpec
): string[] | null {
  const opSecurity = endpoint.operation.security;
  if (opSecurity !== undefined) {
    if (opSecurity.length === 0) return [];
    return opSecurity.flatMap((req) => Object.keys(req));
  }
  if (spec.security !== undefined) {
    if (spec.security.length === 0) return [];
    return spec.security.flatMap((req) => Object.keys(req));
  }
  const keys = Object.keys(spec.components?.securitySchemes ?? {});
  return keys.length ? keys : null;
}

// ─── Param field ──────────────────────────────────────────────────────────────

function renderParamField(param: Parameter, currentValue: string): string {
  const isPath = param.in === "path";
  const schemaType = param.schema?.type ?? "string";
  const required = isPath || !!param.required;

  const labelHtml = `
    <label class="flex items-center gap-1.5 mb-1.5">
      <span class="font-mono text-[11px] text-gray-800">${escapeHtml(param.name)}</span>
      ${required ? '<span class="text-red-500 text-[9px] font-semibold">required</span>' : ""}
      <span class="text-[9px] text-gray-400 bg-gray-100 rounded px-1 font-mono">${param.in}</span>
    </label>`;

  const descHtml = param.description
    ? `<p class="text-[10px] text-gray-400 mt-1">${escapeHtml(param.description)}</p>`
    : "";

  const inputClass =
    "try-input w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 " +
    "placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 " +
    "transition-colors font-mono";

  if (param.schema?.enum?.length) {
    const options = param.schema.enum
      .map((v) => {
        const val = String(v);
        return `<option value="${escapeAttr(val)}" ${val === currentValue ? "selected" : ""}>${escapeHtml(val)}</option>`;
      })
      .join("");
    return `
      <div>
        ${labelHtml}
        <select class="${inputClass}" data-name="${escapeAttr(param.name)}">
          ${!required ? '<option value="">—</option>' : ""}
          ${options}
        </select>
        ${descHtml}
      </div>`;
  }

  const inputType = schemaType === "integer" || schemaType === "number" ? "number" : "text";
  return `
    <div>
      ${labelHtml}
      <input
        type="${inputType}"
        class="${inputClass}"
        data-name="${escapeAttr(param.name)}"
        value="${escapeAttr(currentValue)}"
        placeholder="${escapeAttr(param.schema?.example != null ? String(param.schema.example) : param.name)}"
      />
      ${descHtml}
    </div>`;
}

// ─── Response panel ───────────────────────────────────────────────────────────

function renderResponsePanel(state: TryItState): string {
  if (state.loading) {
    return `
      <div class="shrink-0 border-t border-gray-100 h-14 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50/50">
        <svg class="animate-spin w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        Sending…
      </div>`;
  }

  if (!state.response) {
    return `
      <div class="shrink-0 border-t border-gray-100 h-10 flex items-center justify-center">
        <span class="text-[10px] text-gray-300">Response will appear here</span>
      </div>`;
  }

  const r = state.response;
  const statusOk = r.status >= 200 && r.status < 300;
  const statusColor = r.status === 0
    ? "text-gray-600 bg-gray-50 border-gray-200"
    : statusOk
      ? "text-green-600 bg-green-50 border-green-200"
      : "text-red-600 bg-red-50 border-red-200";

  let body = r.body;
  try { body = JSON.stringify(JSON.parse(body), null, 2); } catch { /* not JSON */ }

  const headersText = Object.entries(r.headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const headerCount = Object.keys(r.headers).length;

  return `
    <div class="shrink-0 border-t border-gray-100 flex flex-col" style="height:280px">
      <!-- Status bar -->
      <div class="flex items-center gap-2 px-4 py-2 border-b border-gray-100 shrink-0">
        <span class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Response</span>
        <span class="text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold ${statusColor}">${r.status}${r.statusText ? " " + escapeHtml(r.statusText) : ""}</span>
        <span class="text-[10px] text-gray-400 font-mono">${r.duration}ms</span>
        <div class="flex-1"></div>
        <button
          id="try-copy-btn"
          class="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          Copy
        </button>
      </div>
      <!-- Tabs -->
      <div class="flex gap-0.5 px-3 py-1.5 border-b border-gray-100 bg-gray-50/50 shrink-0">
        <button class="try-tab px-2.5 py-1 text-[10px] rounded font-medium bg-white shadow-sm text-gray-700 border border-gray-200 transition-colors" data-tab="body">Body</button>
        <button class="try-tab px-2.5 py-1 text-[10px] rounded font-medium text-gray-400 hover:text-gray-600 transition-colors" data-tab="headers">
          Headers <span class="ml-0.5 text-gray-300">${headerCount}</span>
        </button>
      </div>
      <!-- Body tab -->
      <div id="try-tab-body" class="flex-1 overflow-auto bg-white">
        <pre class="text-[11px] p-3 text-gray-700 font-mono leading-relaxed">${escapeHtml(body)}</pre>
      </div>
      <!-- Headers tab -->
      <div id="try-tab-headers" class="hidden flex-1 overflow-auto bg-white">
        <pre class="text-[11px] p-3 text-gray-500 font-mono leading-relaxed">${escapeHtml(headersText)}</pre>
      </div>
    </div>`;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function section(label: string, content: string): string {
  return `
    <div>
      <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">${label}</p>
      <div class="flex flex-col gap-2.5">${content}</div>
    </div>`;
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export function renderTryIt(state: TryItState, spec: OpenAPISpec, authValues: AuthValues): string {
  if (!state.endpoint) {
    return `
      <div class="h-full flex flex-col items-center justify-center text-center px-6 gap-3">
        <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <p class="text-sm text-gray-400">Select an endpoint to try it</p>
      </div>`;
  }

  const ep = state.endpoint;
  const components = spec.components;
  const params = (ep.operation.parameters ?? []).map((p) => resolveParameter(p, components));
  const hasBody = !!ep.operation.requestBody;
  const bodyPlaceholder = getRequestBodyExample(ep, components);
  const servers = spec.servers ?? [{ url: "http://localhost" }];
  const baseUrl = servers[0].url;

  const pathParams = params.filter((p) => p.in === "path");
  const queryParams = params.filter((p) => p.in === "query");
  const headerParams = params.filter((p) => p.in === "header");

  const builtUrl = buildUrl(baseUrl, ep.path, state.paramValues, params);
  const canExecute = pathParams.every((p) => !p.required || state.paramValues[p.name]);

  return `
    <div class="h-full flex flex-col bg-white">

      <!-- Header -->
      <div class="flex items-center gap-2 px-4 py-4 border-b border-gray-100 shrink-0">
        <span class="text-xs font-semibold text-gray-700">Try it out</span>
        <div class="flex-1"></div>
        ${servers.length > 1
          ? `<select id="try-server" class="text-[10px] font-mono text-gray-500 bg-transparent border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400">
               ${servers.map((s) => `<option value="${escapeAttr(s.url)}"${s.url === baseUrl ? " selected" : ""}>${escapeHtml(s.description ?? s.url)}</option>`).join("")}
             </select>`
          : `<span class="text-[10px] font-mono text-gray-400 truncate max-w-[200px]" title="${escapeAttr(baseUrl)}">${escapeHtml(servers[0].description ?? baseUrl)}</span>`
        }
      </div>

      <!-- URL bar + Send -->
      <div class="px-4 py-3 border-b border-gray-100 shrink-0 bg-gray-50/50">
        <div class="flex items-stretch gap-2">
          <div class="flex items-center gap-2 flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-2.5 py-2 shadow-sm">
            <span class="font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${methodBadgeClasses(ep.method)}">${ep.method.toUpperCase()}</span>
            <code class="text-[10px] text-gray-600 leading-tight flex-1 min-w-0 break-all" id="try-url-preview">${escapeHtml(builtUrl)}</code>
          </div>
          <button
            id="try-execute"
            ${!canExecute ? "disabled" : ""}
            class="shrink-0 px-4 rounded-lg text-xs font-semibold transition-all
              ${canExecute
                ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"}"
          >
            Send
          </button>
        </div>
      </div>

      <!-- Scrollable form -->
      <div class="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-5">

        <!-- Auth status -->
        ${(() => {
          const schemeNames = getApplicableSchemeNames(ep, spec);
          const schemes = spec.components?.securitySchemes ?? {};
          if (schemeNames === null || Object.keys(schemes).length === 0) return "";
          if (schemeNames.length === 0) return `
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Authorization</p>
              <p class="text-[10px] text-gray-400">No authentication required for this endpoint.</p>
            </div>`;
          const rows = schemeNames
            .filter((n) => schemes[n])
            .map((n) => {
              const val = authValues[n];
              const authorized = !!(val?.value || val?.username);
              return `
                <div class="flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-gray-100 bg-gray-50/60">
                  <div>
                    <span class="text-[11px] font-mono text-gray-700">${escapeHtml(n)}</span>
                    <span class="ml-1.5 text-[10px] text-gray-400">${escapeHtml(schemeShortLabel(schemes[n]))}</span>
                  </div>
                  ${authorized
                    ? `<span class="text-[9px] text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide">Authorized</span>`
                    : `<span class="text-[9px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 uppercase tracking-wide">Not set</span>`}
                </div>`;
            }).join("");
          return `
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Authorization</p>
              <div class="flex flex-col gap-1.5">${rows}</div>
            </div>`;
        })()}

        <!-- Path params -->
        ${pathParams.length ? section("Path", pathParams.map((p) => renderParamField(p, state.paramValues[p.name] ?? "")).join("")) : ""}

        <!-- Query params -->
        ${queryParams.length ? section("Query", queryParams.map((p) => renderParamField(p, state.paramValues[p.name] ?? "")).join("")) : ""}

        <!-- Header params -->
        ${headerParams.length ? section("Headers", headerParams.map((p) => renderParamField(p, state.paramValues[p.name] ?? "")).join("")) : ""}

        <!-- Request body -->
        ${hasBody ? `
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Body${ep.operation.requestBody?.required ? ' <span class="text-red-500 normal-case font-normal">required</span>' : ""}
              </p>
              <button id="try-body-format" class="text-[10px] text-gray-400 hover:text-blue-600 transition-colors px-1.5 py-0.5 rounded hover:bg-blue-50">
                Format JSON
              </button>
            </div>
            <textarea
              id="try-body"
              rows="8"
              class="w-full text-[11px] border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono resize-y transition-colors leading-relaxed"
              placeholder="${escapeAttr(bodyPlaceholder || "Enter JSON body…")}"
            >${escapeHtml(state.bodyValue || bodyPlaceholder)}</textarea>
          </div>` : ""}

      </div>

      <!-- Response — always anchored at bottom -->
      ${renderResponsePanel(state)}

    </div>`;
}