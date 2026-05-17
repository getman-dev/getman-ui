/**
 * Authorization modal with a tab per security scheme.
 * Handles API key, HTTP basic/bearer, OAuth 2.0, and OpenID Connect.
 */
import { useState, useEffect } from "react";
import type { SecurityScheme, AuthSchemeValue } from "../types/openapi";
import { useAuth } from "../contexts/auth-context";
import { useSpec } from "../contexts/spec-context";

const inputClass =
  "w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 " +
  "text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono";

const TAB_ACTIVE   = "px-3 py-1.5 text-[11px] font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 flex items-center gap-1.5 shrink-0";
const TAB_INACTIVE = "px-3 py-1.5 text-[11px] font-medium rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1.5 shrink-0";

function schemeTypeLabel(scheme: SecurityScheme): string {
  switch (scheme.type) {
    case "apiKey":        return `API Key · ${scheme.in ?? "header"}`;
    case "http":          return `HTTP · ${scheme.scheme ?? "bearer"}`;
    case "oauth2":        return "OAuth 2.0";
    case "openIdConnect": return "OpenID Connect";
    default:              return scheme.type;
  }
}

/** Renders the authorization modal. Visible when authModalVisible is true. */
export default function AuthModal() {
  const { spec } = useSpec();
  const { authModalVisible, authValues, setAuthModalVisible, setAuthValues } = useAuth();

  const schemes = spec?.components?.securitySchemes ?? {};
  const entries = Object.entries(schemes);

  const [activeScheme, setActiveScheme] = useState("");
  const [drafts, setDrafts] = useState<Record<string, AuthSchemeValue>>({});

  // When modal opens, reset active tab and draft values from current saved credentials.
  useEffect(() => {
    if (!authModalVisible || !entries.length) return;
    setActiveScheme(entries[0][0]);
    const initial: Record<string, AuthSchemeValue> = {};
    for (const [name] of entries) {
      initial[name] = { ...(authValues[name] ?? { value: "", username: "", password: "" }) };
    }
    setDrafts(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authModalVisible]);

  function close() { setAuthModalVisible(false); }

  function onBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function authorize(schemeName: string) {
    setAuthValues({ ...authValues, [schemeName]: { ...(drafts[schemeName] ?? { value: "", username: "", password: "" }) } });
  }

  function logout(schemeName: string) {
    const next = { ...authValues };
    delete next[schemeName];
    setAuthValues(next);
    setDrafts(d => ({ ...d, [schemeName]: { value: "", username: "", password: "" } }));
  }

  function isAuthorized(name: string) {
    const v = authValues[name];
    return !!(v?.value || v?.username);
  }

  function updateDraft(name: string, patch: Partial<AuthSchemeValue>) {
    setDrafts(d => ({ ...d, [name]: { ...(d[name] ?? { value: "", username: "", password: "" }), ...patch } }));
  }

  if (!authModalVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50"
      style={{ minHeight: "100vh" }}
      onClick={onBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Authorization</h2>
          </div>
          <button onClick={close} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        {entries.length > 1 && (
          <div className="flex gap-1 px-4 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            {entries.map(([name]) => (
              <button key={name} className={activeScheme === name ? TAB_ACTIVE : TAB_INACTIVE} onClick={() => setActiveScheme(name)}>
                {name}
                {isAuthorized(name) && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-5 py-4">
          {entries.map(([name, scheme]) => {
            if (activeScheme !== name && entries.length !== 1) return null;
            const draft      = drafts[name] ?? { value: "", username: "", password: "" };
            const authorized = isAuthorized(name);

            return (
              <div key={name}>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{schemeTypeLabel(scheme)}</span>
                  {authorized && (
                    <span className="text-[9px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide">Authorized</span>
                  )}
                  {scheme.description && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{scheme.description}</span>
                  )}
                </div>

                {scheme.type === "http" && scheme.scheme?.toLowerCase() === "basic" ? (
                  <div className="flex flex-col gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Username</label>
                      <input type="text" className={inputClass} placeholder="username"
                        value={draft.username}
                        onInput={(e) => updateDraft(name, { username: (e.target as HTMLInputElement).value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Password</label>
                      <input type="password" className={inputClass} placeholder="password"
                        value={draft.password}
                        onInput={(e) => updateDraft(name, { password: (e.target as HTMLInputElement).value })} />
                    </div>
                  </div>

                ) : scheme.type === "apiKey" ? (
                  <div>
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                      Value <span className="text-gray-400 dark:text-gray-500 font-sans">
                        ({scheme.in === "cookie" ? "cookie (read-only in browsers)" : `${scheme.in}: ${scheme.name ?? name}`})
                      </span>
                    </label>
                    <input type="text" className={inputClass} placeholder="api-key-value"
                      value={draft.value}
                      onInput={(e) => updateDraft(name, { value: (e.target as HTMLInputElement).value })} />
                  </div>

                ) : scheme.type === "oauth2" ? (() => {
                  const flows    = scheme.flows ?? {};
                  const authUrl  = flows.authorizationCode?.authorizationUrl ?? flows.implicit?.authorizationUrl;
                  const tokenUrl = flows.authorizationCode?.tokenUrl ?? flows.password?.tokenUrl ?? flows.clientCredentials?.tokenUrl;
                  return (
                    <div className="flex flex-col gap-2">
                      {authUrl  && <p className="text-[10px] text-gray-400 dark:text-gray-500">Auth URL: <code className="font-mono">{authUrl}</code></p>}
                      {tokenUrl && <p className="text-[10px] text-gray-400 dark:text-gray-500">Token URL: <code className="font-mono">{tokenUrl}</code></p>}
                      <div>
                        <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Access Token</label>
                        <input type="text" className={inputClass} placeholder="paste your access token"
                          value={draft.value}
                          onInput={(e) => updateDraft(name, { value: (e.target as HTMLInputElement).value })} />
                      </div>
                    </div>
                  );
                })() : scheme.type === "openIdConnect" ? (
                  <div>
                    {scheme.openIdConnectUrl && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">OpenID Connect: <code className="font-mono text-[9px]">{scheme.openIdConnectUrl}</code></p>
                    )}
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Access Token</label>
                    <div className="flex items-stretch border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700 focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                      <span className="px-2.5 flex items-center text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-600 border-r border-gray-200 dark:border-gray-600 font-mono shrink-0 select-none">Bearer</span>
                      <input type="text" placeholder="your-token"
                        className="flex-1 text-xs px-2.5 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none font-mono min-w-0"
                        value={draft.value}
                        onInput={(e) => updateDraft(name, { value: (e.target as HTMLInputElement).value })} />
                    </div>
                  </div>

                ) : (
                  // HTTP bearer (default)
                  <div>
                    <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                      Token{scheme.bearerFormat && <span className="text-gray-400 dark:text-gray-500 font-sans"> ({scheme.bearerFormat})</span>}
                    </label>
                    <div className="flex items-stretch border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700 focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                      <span className="px-2.5 flex items-center text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-600 border-r border-gray-200 dark:border-gray-600 font-mono shrink-0 select-none">Bearer</span>
                      <input type="text" placeholder="your-token"
                        className="flex-1 text-xs px-2.5 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none font-mono min-w-0"
                        value={draft.value}
                        onInput={(e) => updateDraft(name, { value: (e.target as HTMLInputElement).value })} />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3">
                  <button onClick={() => authorize(name)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors">
                    Authorize
                  </button>
                  {authorized && (
                    <button onClick={() => logout(name)} className="text-xs border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 rounded-md font-medium transition-colors">
                      Logout
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-end shrink-0">
          <button onClick={close} className="text-xs bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-md font-medium transition-colors">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
