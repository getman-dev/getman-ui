/** Endpoint documentation view: header, parameters table, request body, and responses accordion. */
import {useEffect, useMemo, useState} from "react";
import type {Parameter, Response} from "../spec/openapi";
import {useNav} from "../nav/nav-context";
import {useSpec} from "../spec/spec-context";
import {resolveParameter, resolveResponse, resolveSchema} from "../spec/ref-resolver";
import SchemaViewer from "../schema/SchemaViewer";
import clsx from "clsx";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface EndpointTheme {
  container: ThemeSlot;
  header: ThemeSlot;
  methodBadge: ThemeSlot; // variants: get, post, put, patch, delete, head, options
  path: ThemeSlot;
  summary: ThemeSlot;
  description: ThemeSlot;
  deprecated: ThemeSlot;
  paramSection: ThemeSlot;
  paramSectionTitle: ThemeSlot;
  paramLocTitle: ThemeSlot;
  paramRow: ThemeSlot;
  paramName: ThemeSlot;
  paramType: ThemeSlot;
  paramRequired: ThemeSlot;
  paramDescription: ThemeSlot;
  mutedText: ThemeSlot;
  responseAccordion: ThemeSlot;
  responseHeader: ThemeSlot;
  responseStatusCode: ThemeSlot; // variants: success, redirect, clientError, serverError
  responseDescription: ThemeSlot;
  bodySection: ThemeSlot;
  bodyContentType: ThemeSlot;
}

const paramLocations = ["path", "query", "header", "cookie"] as const;

function responseStatusVariants(code: string): Record<string, boolean> {
  const n = parseInt(code, 10);
  return {
    success: n >= 200 && n < 300,
    redirect: n >= 300 && n < 400,
    clientError: n >= 400 && n < 500,
    serverError: n >= 500,
  };
}

/** Renders full endpoint documentation: path, params table, request body, and response accordion. */
export default function EndpointDetail() {
  const {activeEndpoint} = useNav();
  const {spec} = useSpec();
  const t = useTheme().endpoint;

  const components = spec?.components;
  const op = activeEndpoint?.operation;

  const [openResponses, setOpenResponses] = useState(new Set<string>());

  // Reset accordion when active endpoint changes.
  useEffect(() => {
    setOpenResponses(new Set());
  }, [activeEndpoint]);

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
    path: params.filter(p => p.in === "path"),
    query: params.filter(p => p.in === "query"),
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
      const response = resolveResponse(raw as Response, components);
      const content = response.content ?? {};
      const mediaKey = (["application/json", "*/*"] as const).find(k => k in content) ?? Object.keys(content)[0];
      const mediaType = mediaKey ? content[mediaKey] : undefined;

      let example: string | null = null;
      if (mediaType?.example !== undefined) {
        example = JSON.stringify(mediaType.example, null, 2);
      } else if (mediaType?.examples) {
        const first = Object.values(mediaType.examples)[0];
        if (first?.value !== undefined) example = JSON.stringify(first.value, null, 2);
      }

      return {code, response, mediaKey, mediaType, example};
    });
  }, [op, components]);

  if (!activeEndpoint || !op) return null;

  return (
      <div className={slot(t.container)}>

        <div className={slot(t.header)}>
        <span className={slot(t.methodBadge, {[activeEndpoint.method.toLowerCase()]: true})}>
          {activeEndpoint.method}
        </span>
          <code className={slot(t.path)}>{activeEndpoint.path}</code>
          {op.deprecated && (
              <span className={slot(t.deprecated)}>deprecated</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {op.summary && <p className={slot(t.summary)}>{op.summary}</p>}
          {op.description
              ? <p className={`${slot(t.description)} mb-8 leading-relaxed`}>{op.description}</p>
              : <div className="mb-6"/>
          }

          <div className="mb-8">
            <h3 className={slot(t.paramSectionTitle)}>Parameters</h3>
            {params.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No parameters</p>
            ) : (
                paramLocations.map(loc => {
                  if (!grouped[loc].length) return null;
                  return (
                      <div key={loc} className="mb-5">
                        <h4 className={slot(t.paramLocTitle)}>{loc}</h4>
                        <div className={slot(t.paramSection)}>
                          <table className="w-full border-collapse">
                            <tbody>
                            {grouped[loc].map(rawParam => {
                              const param = resolveParameter(rawParam as Parameter, components);
                              const schema = resolveSchema(param.schema, components);
                              return (
                                  <tr key={param.name} className={slot(t.paramRow)}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span className={slot(t.paramName)}>{param.name}</span>
                                      {param.required &&
                                          <span className={slot(t.paramRequired)}>*</span>}
                                      {param.deprecated && <span
                                          className={`text-[9px] ml-1 ${slot(t.mutedText)}`}>deprecated</span>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                                            <span
                                                                className={slot(t.paramType)}>{schema?.type ?? "string"}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      {schema?.minimum !== undefined && <span
                                          className={`text-[10px] font-mono ${slot(t.mutedText)}`}>min:{schema.minimum}</span>}
                                      {schema?.maximum !== undefined && <span
                                          className={`text-[10px] font-mono ml-1.5 ${slot(t.mutedText)}`}>max:{schema.maximum}</span>}
                                    </td>
                                    <td className={slot(t.paramDescription)}>
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
                <h3 className={slot(t.paramSectionTitle)}>Request body</h3>
                {op.requestBody.description && (
                    <p className={`${slot(t.description)} mb-2`}>{op.requestBody.description}</p>
                )}
                <div className={slot(t.paramSection)}>
                  <div className={slot(t.bodySection)}>
                    <span className={slot(t.bodyContentType)}>application/json</span>
                    {op.requestBody.required &&
                        <span className="text-[9px] text-red-500 font-semibold">required</span>}
                  </div>
                  <SchemaViewer schema={jsonContent.schema} components={components}
                                options={{example: bodyExample, required: op.requestBody.required}}/>
                </div>
              </div>
          )}

          {responses.length > 0 && (
              <div className="mb-8">
                <h3 className={slot(t.paramSectionTitle)}>Responses</h3>
                <div className={slot(t.responseAccordion)}>
                  {responses.map(({code, response, mediaKey, mediaType, example}) => {
                    const isOpen = openResponses.has(code);
                    const hasContent = !!mediaType?.schema;
                    return (
                        <div key={code}>
                          <button
                              className={slot(t.responseHeader)}
                              onClick={() => hasContent && toggleResponse(code)}
                          >
                                            <span
                                                className={slot(t.responseStatusCode, responseStatusVariants(code))}>{code}</span>
                            <span className={slot(t.responseDescription)}>{response.description}</span>
                            {mediaKey && <span
                                className={`text-[10px] font-mono shrink-0 ${slot(t.mutedText)}`}>{mediaKey}</span>}
                            {hasContent && (
                                <svg
                                    className={clsx(`w-3 h-3 transition-transform shrink-0 ${slot(t.mutedText)}`, isOpen && "rotate-180")}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M19 9l-7 7-7-7"/>
                                </svg>
                            )}
                          </button>
                          {hasContent && isOpen && (
                              <SchemaViewer schema={mediaType!.schema!} components={components}
                                            options={{example}}/>
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