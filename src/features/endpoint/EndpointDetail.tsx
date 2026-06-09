/** Endpoint documentation view: header, parameters table, request body, and responses accordion. */
import { useState, useEffect, useMemo } from "react";
import type { Parameter, Response } from "../spec/openapi";
import { useNav } from "../nav/nav-context";
import { useSpec } from "../spec/spec-context";
import { resolveParameter, resolveSchema, resolveResponse } from "../spec/ref-resolver";
import { methodBadgeClasses } from "../../shared/utils/badges";
import SchemaViewer from "../schema/SchemaViewer";
import clsx from "clsx";
import type { ThemeSlot } from "../../themes/slot";

export interface EndpointTheme {
  container:          ThemeSlot;
  header:             ThemeSlot;
  methodBadge:        ThemeSlot; // variants: get, post, put, patch, delete, head, options
  path:               ThemeSlot;
  summary:            ThemeSlot;
  description:        ThemeSlot;
  deprecated:         ThemeSlot;
  paramSection:       ThemeSlot;
  paramSectionTitle:  ThemeSlot;
  paramRow:           ThemeSlot; // variants: required
  paramName:          ThemeSlot;
  paramType:          ThemeSlot;
  paramRequired:      ThemeSlot;
  paramDescription:   ThemeSlot;
  responseAccordion:  ThemeSlot;
  responseHeader:     ThemeSlot; // variants: open
  responseStatusCode: ThemeSlot; // variants: success, redirect, clientError, serverError
  responseDescription:ThemeSlot;
  bodySection:        ThemeSlot;
  bodyContentType:    ThemeSlot;
}

const paramLocations = ["path", "query", "header", "cookie"] as const;

function statusClass(code: string): string {
  const n = parseInt(code);
  if (n >= 200 && n < 300) return "text-green-600 dark:text-green-400 font-mono font-semibold";
  if (n >= 400 && n < 500) return "text-amber-600 dark:text-amber-400 font-mono font-semibold";
  if (n >= 500)             return "text-red-600 dark:text-red-400 font-mono font-semibold";
  return "text-blue-600 dark:text-blue-400 font-mono font-semibold";
}

/** Renders full endpoint documentation: path, params table, request body, and response accordion. */
export default function EndpointDetail() {
  const { activeEndpoint } = useNav();
  const { spec } = useSpec();

  const components = spec?.components;
  const op         = activeEndpoint?.operation;

  const [openResponses, setOpenResponses] = useState(new Set<string>());

  // Reset accordion when active endpoint changes.
  useEffect(() => { setOpenResponses(new Set()); }, [activeEndpoint]);

  function toggleResponse(code: string) {
    setOpenResponses(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  const params = useMemo(
    () => (op?.parameters ?? []).map(p => resolveParameter(p, components)),
    [op, components]
  );

  const grouped = useMemo(() => ({
    path:   params.filter(p => p.in === "path"),
    query:  params.filter(p => p.in === "query"),
    header: params.filter(p => p.in === "header"),
    cookie: params.filter(p => p.in === "cookie"),
  }), [params]);

  const jsonContent = op?.requestBody?.content?.["application/json"];

  const bodyExample: string | null = useMemo(() => {
    if (!jsonContent) return null;
    if (jsonContent.example !== undefined) return JSON.stringify(jsonContent.example, null, 2);
    if (jsonContent.examples) return JSON.stringify(Object.values(jsonContent.examples)[0]?.value ?? {}, null, 2);
    return null;
  }, [jsonContent]);

  const responses = useMemo(() => {
    if (!op?.responses) return [];
    return Object.entries(op.responses).map(([code, raw]) => {
      const response  = resolveResponse(raw as Response, components);
      const content   = response.content ?? {};
      const mediaKey  = (["application/json", "*/*"] as const).find(k => k in content) ?? Object.keys(content)[0];
      const mediaType = mediaKey ? content[mediaKey] : undefined;

      let example: string | null = null;
      if (mediaType?.example !== undefined) {
        example = JSON.stringify(mediaType.example, null, 2);
      } else if (mediaType?.examples) {
        const first = Object.values(mediaType.examples)[0];
        if (first?.value !== undefined) example = JSON.stringify(first.value, null, 2);
      }

      return { code, response, mediaKey, mediaType, example };
    });
  }, [op, components]);

  if (!activeEndpoint || !op) return null;

  return (
    <div className="h-full flex flex-col">

      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-700 shrink-0 h-[50px]">
        <span className={`method-badge shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded ${methodBadgeClasses(activeEndpoint.method)} uppercase w-[36px] text-center`}>
          {activeEndpoint.method}
        </span>
        <code className="font-mono text-sm text-gray-800 dark:text-gray-200">{activeEndpoint.path}</code>
        {op.deprecated && (
          <span className="ml-auto text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 rounded px-2 py-0.5">deprecated</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {op.summary && <p className="text-sm text-gray-700 dark:text-gray-200 mb-2 font-medium">{op.summary}</p>}
        {op.description
          ? <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">{op.description}</p>
          : <div className="mb-6" />
        }

        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Parameters</h3>
          {params.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No parameters</p>
          ) : (
            paramLocations.map(loc => {
              if (!grouped[loc].length) return null;
              return (
                <div key={loc} className="mb-5">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">{loc}</h4>
                  <div className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full border-collapse">
                      <tbody>
                        {grouped[loc].map(rawParam => {
                          const param  = resolveParameter(rawParam as Parameter, components);
                          const schema = resolveSchema(param.schema, components);
                          return (
                            <tr key={param.name} className="border-b border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="font-mono text-[11px] text-gray-800 dark:text-gray-200">{param.name}</span>
                                {param.required   && <span className="text-red-500 text-[9px] font-semibold ml-1">*</span>}
                                {param.deprecated && <span className="text-gray-400 dark:text-gray-500 text-[9px] ml-1">deprecated</span>}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded px-1.5 py-0.5 font-mono">{schema?.type ?? "string"}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {schema?.minimum !== undefined && <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">min:{schema.minimum}</span>}
                                {schema?.maximum !== undefined && <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 ml-1.5">max:{schema.maximum}</span>}
                              </td>
                              <td className="px-4 py-3 w-full text-xs text-gray-500 dark:text-gray-400">
                                {param.description ?? schema?.description ?? ""}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {op.requestBody && jsonContent?.schema && (
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Request body</h3>
            {op.requestBody.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{op.requestBody.description}</p>
            )}
            <div className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">application/json</span>
                {op.requestBody.required && <span className="text-[9px] text-red-500 font-semibold">required</span>}
              </div>
              <SchemaViewer schema={jsonContent.schema} components={components} options={{ example: bodyExample, required: op.requestBody.required }} />
            </div>
          </div>
        )}

        {responses.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Responses</h3>
            <div className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
              {responses.map(({ code, response, mediaKey, mediaType, example }) => {
                const isOpen     = openResponses.has(code);
                const hasContent = !!mediaType?.schema;
                return (
                  <div key={code}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                      onClick={() => hasContent && toggleResponse(code)}
                    >
                      <span className={`text-xs ${statusClass(code)}`}>{code}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{response.description}</span>
                      {mediaKey && <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 shrink-0">{mediaKey}</span>}
                      {hasContent && (
                        <svg
                          className={clsx("w-3 h-3 text-gray-400 dark:text-gray-500 transition-transform shrink-0", isOpen && "rotate-180")}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                        </svg>
                      )}
                    </button>
                    {hasContent && isOpen && (
                      <SchemaViewer schema={mediaType!.schema!} components={components} options={{ example }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
