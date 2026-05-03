import type { SecurityScheme, AuthValues } from "../types/openapi";
import { escapeHtml, escapeAttr } from "../utils/html";

function schemeTypeLabel(scheme: SecurityScheme): string {
  switch (scheme.type) {
    case "apiKey":    return `API Key · ${scheme.in ?? "header"}`;
    case "http":      return `HTTP · ${scheme.scheme ?? "bearer"}`;
    case "oauth2":    return "OAuth 2.0";
    case "openIdConnect": return "OpenID Connect";
    default:          return scheme.type;
  }
}

function renderSchemeForm(name: string, scheme: SecurityScheme, value: AuthValues[string] | undefined): string {
  const inputClass =
    "w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 " +
    "placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono";

  if (scheme.type === "http" && scheme.scheme?.toLowerCase() === "basic") {
    return `
      <div class="flex flex-col gap-2">
        <div>
          <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Username</label>
          <input type="text" class="auth-input ${inputClass}"
            data-scheme="${escapeAttr(name)}" data-field="username"
            value="${escapeAttr(value?.username ?? "")}" placeholder="username" />
        </div>
        <div>
          <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Password</label>
          <input type="password" class="auth-input ${inputClass}"
            data-scheme="${escapeAttr(name)}" data-field="password"
            value="${escapeAttr(value?.password ?? "")}" placeholder="password" />
        </div>
      </div>`;
  }

  if (scheme.type === "apiKey") {
    const location = scheme.in === "cookie" ? "cookie (read-only in browsers)" : `${scheme.in}: ${scheme.name ?? name}`;
    return `
      <div>
        <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Value <span class="text-gray-400 dark:text-gray-500 font-sans">(${escapeHtml(location)})</span></label>
        <input type="text" class="auth-input ${inputClass}"
          data-scheme="${escapeAttr(name)}" data-field="value"
          value="${escapeAttr(value?.value ?? "")}" placeholder="api-key-value" />
      </div>`;
  }

  if (scheme.type === "oauth2") {
    const flows = scheme.flows ?? {};
    const authUrl = flows.authorizationCode?.authorizationUrl ?? flows.implicit?.authorizationUrl;
    const tokenUrl = flows.authorizationCode?.tokenUrl ?? flows.password?.tokenUrl ?? flows.clientCredentials?.tokenUrl;
    return `
      <div class="flex flex-col gap-2">
        ${authUrl ? `<p class="text-[10px] text-gray-400 dark:text-gray-500">Auth URL: <code class="font-mono">${escapeHtml(authUrl)}</code></p>` : ""}
        ${tokenUrl ? `<p class="text-[10px] text-gray-400 dark:text-gray-500">Token URL: <code class="font-mono">${escapeHtml(tokenUrl)}</code></p>` : ""}
        <div>
          <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Access Token</label>
          <input type="text" class="auth-input ${inputClass}"
            data-scheme="${escapeAttr(name)}" data-field="value"
            value="${escapeAttr(value?.value ?? "")}" placeholder="paste your access token" />
        </div>
      </div>`;
  }

  if (scheme.type === "openIdConnect") {
    return `
      <div>
        ${scheme.openIdConnectUrl ? `<p class="text-[10px] text-gray-400 dark:text-gray-500 mb-2">OpenID Connect: <code class="font-mono text-[9px]">${escapeHtml(scheme.openIdConnectUrl)}</code></p>` : ""}
        <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Access Token</label>
        <div class="flex items-stretch border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700 focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
          <span class="px-2.5 flex items-center text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-600 border-r border-gray-200 dark:border-gray-600 font-mono shrink-0 select-none">Bearer</span>
          <input type="text" class="auth-input flex-1 text-xs px-2.5 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none font-mono min-w-0"
            data-scheme="${escapeAttr(name)}" data-field="value"
            value="${escapeAttr(value?.value ?? "")}" placeholder="your-token" />
        </div>
      </div>`;
  }

  // http bearer (default)
  return `
    <div>
      <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Token${scheme.bearerFormat ? ` <span class="text-gray-400 dark:text-gray-500 font-sans">(${escapeHtml(scheme.bearerFormat)})</span>` : ""}</label>
      <div class="flex items-stretch border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700 focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
        <span class="px-2.5 flex items-center text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-600 border-r border-gray-200 dark:border-gray-600 font-mono shrink-0 select-none">Bearer</span>
        <input type="text" class="auth-input flex-1 text-xs px-2.5 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none font-mono min-w-0"
          data-scheme="${escapeAttr(name)}" data-field="value"
          value="${escapeAttr(value?.value ?? "")}" placeholder="your-token" />
      </div>
    </div>`;
}

export function renderAuthModal(
  visible: boolean,
  schemes: Record<string, SecurityScheme>,
  authValues: AuthValues
): string {
  if (!visible) return "";

  const entries = Object.entries(schemes);

  return `
    <div id="auth-modal-backdrop" class="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50" style="min-height:100vh">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">

        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Authorization</h2>
          </div>
          <button id="auth-modal-close" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        <div class="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          ${entries.map(([name, scheme]) => {
            const val = authValues[name];
            const authorized = !!(val?.value || val?.username);
            return `
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-semibold text-gray-800 dark:text-gray-200 font-mono">${escapeHtml(name)}</span>
                      ${authorized
                        ? `<span class="text-[9px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide">Authorized</span>`
                        : ""}
                    </div>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500">${escapeHtml(schemeTypeLabel(scheme))}</span>
                    ${scheme.description ? `<p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">${escapeHtml(scheme.description)}</p>` : ""}
                  </div>
                </div>
                ${renderSchemeForm(name, scheme, val)}
                <div class="flex gap-2 pt-1">
                  <button class="auth-authorize-btn text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors" data-scheme="${escapeAttr(name)}">
                    Authorize
                  </button>
                  ${authorized
                    ? `<button class="auth-logout-btn text-xs border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 rounded-md font-medium transition-colors" data-scheme="${escapeAttr(name)}">
                        Logout
                      </button>`
                    : ""}
                </div>
              </div>`;
          }).join("")}
        </div>

        <div class="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-end shrink-0">
          <button id="auth-modal-done" class="text-xs bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-md font-medium transition-colors">Close</button>
        </div>
      </div>
    </div>`;
}