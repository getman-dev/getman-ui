/** Try-it-out panel: params, body, auth status, URL preview, and response viewer. */
import { useState, useEffect, useMemo } from "react";
import type { Schema, Components } from "../types/openapi";
import { usePlayground } from "../contexts/playground-context";
import { useSpec } from "../contexts/spec-context";
import { useAuth } from "../contexts/auth-context";
import { useServer } from "../contexts/server-context";
import { executePlayground } from "../state/actions";
import { resolveParameter, resolveSchema } from "../parser/ref-resolver";
import { buildUrl, resolveServerUrl, getRequestBodyExample } from "../parser/example-gen";
import { methodBadgeClasses } from "../utils/badges";
import { highlightJson } from "../utils/highlight";
import ServerConfig from "./ServerConfig";
import clsx from "clsx";

const inputClass =
  "w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 " +
  "text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono";

const fileInputClass =
  "block w-full text-xs text-gray-600 dark:text-gray-400 cursor-pointer " +
  "file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 " +
  "file:text-xs file:font-medium file:bg-blue-50 dark:file:bg-blue-900/40 " +
  "file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/60";

function schemeShortLabel(type: string, schemeOrIn?: string): string {
  if (type === "apiKey")        return `API Key (${schemeOrIn ?? "header"})`;
  if (type === "http")          return `HTTP ${schemeOrIn ?? "bearer"}`;
  if (type === "oauth2")        return "OAuth 2.0";
  if (type === "openIdConnect") return "OpenID Connect";
  return type;
}

const LOCATION_BADGE_CLASS: Record<string, string> = {
  path:   "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30",
  query:  "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30",
  header: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30",
  form:   "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30",
};

interface ParamLabelProps {
  name: string;
  /** "path" | "query" | "header" | "form" — shown as a color-coded location badge. */
  location: string;
  /** Resolved type string shown as a badge, e.g. "string", "integer", "string·date-time". */
  typeBadge?: string;
  required: boolean;
  description?: string;
}

/** Label row for a parameter or body field: name on the left, badges + help icon on the right. */
function ParamLabel({ name, location, typeBadge, required, description }: ParamLabelProps) {
  const locClass = LOCATION_BADGE_CLASS[location] ?? "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="font-mono text-[11px] text-gray-800 dark:text-gray-200">{name}</span>
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <span className={`text-[9px] font-mono rounded px-1.5 py-0.5 leading-none ${locClass}`}>
          {location}
        </span>
        {typeBadge && (
          <span className="text-[9px] font-mono text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 rounded px-1.5 py-0.5 leading-none">
            {typeBadge}
          </span>
        )}
        {required && (
          <span className="text-[9px] font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded px-1.5 py-0.5 leading-none">
            required
          </span>
        )}
        {description && (
          <span className="relative group/tip">
            <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help hover:text-gray-600 dark:hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="pointer-events-none absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-gray-900 dark:bg-gray-950 px-2.5 py-2 text-[10px] text-gray-100 leading-snug shadow-lg opacity-0 group-hover/tip:opacity-100 transition-opacity z-50">
              {description}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

/** Renders the try-it-out panel: URL bar, params, body, and response. */
export default function Playground() {
  const { endpoint, paramValues, bodyValue, bodyParams, fileValues, response, loading,
          setParamValues, setBodyValue, setBodyParams, setFileValues } = usePlayground();
  const { spec } = useSpec();
  const { authValues } = useAuth();
  const { selectedServer, serverVariables } = useServer();

  const [responseTab, setResponseTab] = useState<"body" | "headers">("body");
  const [copied, setCopied] = useState(false);

  const components = spec?.components;
  const op         = endpoint?.operation;

  const params = useMemo(
    () => (op?.parameters ?? []).map(p => resolveParameter(p, components)),
    [op, components]
  );
  const pathParams   = params.filter(p => p.in === "path");
  const queryParams  = params.filter(p => p.in === "query");
  const headerParams = params.filter(p => p.in === "header");

  const servers      = spec?.servers ?? [{ url: "http://localhost" }];
  const activeServer = servers.find(s => s.url === selectedServer) ?? servers[0];
  const resolvedBase = activeServer
    ? resolveServerUrl(activeServer, serverVariables)
    : (servers[0]?.url ?? "http://localhost");

  const resolvedUrl = endpoint ? buildUrl(resolvedBase, endpoint.path, paramValues, params) : "";
  const canExecute  = !!endpoint && pathParams.every(p => !p.required || paramValues[p.name]);

  const bodyContentType = useMemo((): string => {
    if (!op) return "application/json";
    const content = op.requestBody?.content ?? {};
    if ("multipart/form-data"      in content) return "multipart/form-data";
    if ("application/octet-stream" in content) return "application/octet-stream";
    if ("application/json"         in content) return "application/json";
    return Object.keys(content)[0] ?? "application/json";
  }, [op]);

  const multipartSchema = useMemo((): Schema | null => {
    if (bodyContentType !== "multipart/form-data" || !op) return null;
    return resolveSchema(op.requestBody?.content?.["multipart/form-data"]?.schema, components) ?? null;
  }, [bodyContentType, op, components]);

  const prettyBody = useMemo(() => {
    const body = response?.body ?? "";
    try { return JSON.stringify(JSON.parse(body), null, 2); } catch { return body; }
  }, [response]);

  const highlightedBody = useMemo(() => highlightJson(prettyBody), [prettyBody]);
  const headersText     = Object.entries(response?.headers ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n");

  // Pre-fill body textarea with example when endpoint changes and body is still empty.
  useEffect(() => {
    if (!endpoint || bodyValue) return;
    const example = getRequestBodyExample(endpoint, spec?.components);
    if (example) setBodyValue(example);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  // Reset response tab whenever a new response arrives.
  useEffect(() => { setResponseTab("body"); }, [response]);

  function setParam(name: string, value: string) {
    setParamValues({ ...paramValues, [name]: value });
  }
  function setBodyParam(name: string, value: string) {
    setBodyParams({ ...bodyParams, [name]: value });
  }
  function setFileField(name: string, files: FileList, multiple: boolean) {
    setFileValues({ ...fileValues, [name]: multiple ? Array.from(files) : files[0] });
  }
  function formatJson() {
    try { setBodyValue(JSON.stringify(JSON.parse(bodyValue), null, 2)); } catch { }
  }
  async function copyResponse() {
    await navigator.clipboard.writeText(prettyBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getApplicableSchemeNames(): string[] | null {
    if (!endpoint || !spec) return null;
    const opSecurity = endpoint.operation.security;
    if (opSecurity !== undefined) {
      if (opSecurity.length === 0) return [];
      return opSecurity.flatMap(req => Object.keys(req));
    }
    if (spec.security !== undefined) {
      if (spec.security.length === 0) return [];
      return spec.security.flatMap(req => Object.keys(req));
    }
    const keys = Object.keys(spec.components?.securitySchemes ?? {});
    return keys.length ? keys : null;
  }

  function renderParamField(param: ReturnType<typeof resolveParameter>, value: string) {
    const isPath   = param.in === "path";
    const required = isPath || !!param.required;
    const hasEnum  = !!param.schema?.enum?.length;
    const inputType = (param.schema?.type === "integer" || param.schema?.type === "number") ? "number" : "text";
    const schema    = param.schema;
    const typeBadge = hasEnum ? "enum" : schema?.format ? `${schema.type ?? "string"}·${schema.format}` : schema?.type;
    return (
      <div key={param.name}>
        <ParamLabel name={param.name} location={param.in} typeBadge={typeBadge} required={required} description={param.description} />
        {hasEnum ? (
          <select className={inputClass} value={value} onChange={(e) => setParam(param.name, e.target.value)}>
            {!required && <option value="">—</option>}
            {(param.schema?.enum ?? []).map(v => (
              <option key={String(v)} value={String(v)}>{String(v)}</option>
            ))}
          </select>
        ) : (
          <input
            type={inputType}
            className={inputClass}
            value={value}
            placeholder={param.schema?.example != null ? String(param.schema.example) : param.name}
            onInput={(e) => setParam(param.name, (e.target as HTMLInputElement).value)}
          />
        )}
      </div>
    );
  }

  function renderMultipartField(name: string, prop: Schema, required: boolean, components: Components | undefined) {
    const resolved      = resolveSchema(prop, components);
    const isBinary      = resolved?.format === "binary";
    const isMultiBinary = resolved?.type === "array" && resolveSchema(resolved.items, components)?.format === "binary";
    const isObject      = resolved?.type === "object" || (resolved?.properties != null && !isBinary);
    const inputType     = (resolved?.type === "integer" || resolved?.type === "number") ? "number" : "text";
    const typeBadge     = isBinary ? "file" : isMultiBinary ? "file[]" : resolved?.format ? `${resolved.type ?? "string"}·${resolved.format}` : resolved?.type;
    return (
      <div key={name}>
        <ParamLabel name={name} location="form" typeBadge={typeBadge} required={required} description={resolved?.description} />
        {isBinary ? (
          <input type="file" className={fileInputClass}
            onChange={(e) => { const f = e.target.files; if (f?.length) setFileField(name, f, false); }} />
        ) : isMultiBinary ? (
          <input type="file" multiple className={fileInputClass}
            onChange={(e) => { const f = e.target.files; if (f?.length) setFileField(name, f, true); }} />
        ) : isObject ? (
          <textarea rows={3} className={inputClass} placeholder={`{"key": "value"}`}
            value={bodyParams[name] ?? ""}
            onInput={(e) => setBodyParam(name, (e.target as HTMLTextAreaElement).value)} />
        ) : (
          <input type={inputType} className={inputClass}
            placeholder={resolved?.example != null ? String(resolved.example) : name}
            value={bodyParams[name] ?? ""}
            onInput={(e) => setBodyParam(name, (e.target as HTMLInputElement).value)} />
        )}
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-3 bg-white dark:bg-gray-900">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">Select an endpoint to use the playground</p>
      </div>
    );
  }

  const rb          = op?.requestBody;
  const schemeNames = getApplicableSchemeNames();
  const allSchemes  = spec?.components?.securitySchemes ?? {};

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">

      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Playground</span>
        <div className="flex-1" />
        <ServerConfig source="playground" />
      </div>

      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="flex items-stretch gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-2">
            <span className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${methodBadgeClasses(endpoint.method)}`}>
              {endpoint.method.toUpperCase()}
            </span>
            <code className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight flex-1 min-w-0 break-all">
              {resolvedUrl}
            </code>
          </div>
          <button
            disabled={!canExecute || loading}
            title={canExecute ? "Send request (⌘ Enter)" : "Fill required path parameters first"}
            onClick={executePlayground}
            className={clsx(
              "shrink-0 px-4 rounded-lg text-xs font-semibold transition-all",
              canExecute && !loading
                ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            )}
          >
            Send
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 flex flex-col gap-7">

        {schemeNames !== null && Object.keys(allSchemes).length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Authorization</p>
            {schemeNames.length === 0 ? (
              <p className="text-[10px] text-gray-400 dark:text-gray-500">No authentication required for this endpoint.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {schemeNames.filter(n => allSchemes[n]).map(n => {
                  const scheme     = allSchemes[n];
                  const val        = authValues[n];
                  const authorized = !!(val?.value || val?.username);
                  return (
                    <div key={n} className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/30">
                      <div>
                        <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300">{n}</span>
                        <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                          {schemeShortLabel(scheme.type, scheme.in ?? scheme.scheme)}
                        </span>
                      </div>
                      {authorized
                        ? <span className="text-[9px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide">Authorized</span>
                        : <span className="text-[9px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 uppercase tracking-wide">Not set</span>
                      }
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(() => {
          const regularParams = [...pathParams, ...queryParams, ...headerParams];
          const multipartFields = bodyContentType === "multipart/form-data" && multipartSchema?.properties
            ? Object.entries(multipartSchema.properties)
            : [];
          const hasParams = regularParams.length > 0 || multipartFields.length > 0;
          if (!hasParams) return null;
          const requiredSet = new Set(multipartSchema?.required ?? []);
          return (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Parameters</p>
              <div className="flex flex-col gap-4">
                {regularParams.map(p => renderParamField(p, paramValues[p.name] ?? ""))}
                {multipartFields.map(([name, prop]) => renderMultipartField(name, prop, requiredSet.has(name), components))}
              </div>
            </div>
          );
        })()}

        {rb && bodyContentType !== "multipart/form-data" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Body{rb.required && <span className="text-red-500 normal-case font-normal"> required</span>}
              </p>
              <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5">
                {bodyContentType}
              </span>
            </div>

            {bodyContentType === "application/octet-stream" ? (
              <input type="file" className={fileInputClass}
                onChange={(e) => { const f = e.target.files; if (f?.length) setFileValues({ ...fileValues, __raw__: f[0] }); }} />
            ) : (
              <>
                <div className="flex justify-end mb-2">
                  <button
                    onClick={formatJson}
                    className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-1.5 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >Format JSON</button>
                </div>
                <textarea
                  rows={8}
                  value={bodyValue}
                  onChange={(e) => setBodyValue(e.target.value)}
                  placeholder="Enter JSON body…"
                  className="w-full text-[11px] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono resize-y transition-colors leading-relaxed"
                />
              </>
            )}
          </div>
        )}

      </div>

      {loading ? (
        <div className="shrink-0 border-t border-gray-100 dark:border-gray-700 h-16 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30">
          <svg className="animate-spin w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          Sending…
        </div>

      ) : !response ? (
        <div className="shrink-0 border-t border-gray-100 dark:border-gray-700 h-10 flex items-center justify-center">
          <span className="text-[10px] text-gray-300 dark:text-gray-600">Response will appear here</span>
        </div>

      ) : (() => {
        const r         = response;
        const statusOk  = r.status >= 200 && r.status < 300;
        const statusColor = r.status === 0
          ? "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
          : statusOk
            ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700"
            : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700";
        return (
          <div className="shrink-0 border-t border-gray-100 dark:border-gray-700 flex flex-col" style={{ height: 280 }}>

            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Response</span>
              <span className={`text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold ${statusColor}`}>
                {r.status}{r.statusText ? ` ${r.statusText}` : ""}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{r.duration}ms</span>
              <div className="flex-1" />
              <button
                onClick={copyResponse}
                className={clsx(
                  "flex items-center gap-1 text-[10px] px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                  copied ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                {copied ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-0.5 px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 shrink-0">
              {(["body", "headers"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setResponseTab(tab)}
                  className={clsx(
                    "px-2.5 py-1 text-[10px] rounded font-medium transition-colors",
                    responseTab === tab
                      ? "bg-white dark:bg-gray-700 shadow-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                      : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  {tab === "headers" ? (
                    <>Headers <span className="ml-0.5 text-gray-300 dark:text-gray-600">{Object.keys(r.headers).length}</span></>
                  ) : "Body"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
              {responseTab === "body" ? (
                <pre
                  className="text-[11px] p-3 text-gray-700 dark:text-gray-300 font-mono leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightedBody }}
                />
              ) : (
                <pre className="text-[11px] p-3 text-gray-500 dark:text-gray-400 font-mono leading-relaxed">{headersText}</pre>
              )}
            </div>

          </div>
        );
      })()}

    </div>
  );
}
