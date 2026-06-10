/** Try-it-out panel: normalises parameters to FieldSpec and orchestrates sub-components. */
import { useEffect, useMemo, useState } from "react";
import type { Schema, Components, Operation, SecurityScheme, AuthValues } from "../spec/openapi";
import { usePlayground } from "./playground-context";
import { useSpec } from "../spec/spec-context";
import { useAuth } from "../auth/auth-context";
import { useServer } from "../server/server-context";
import { executePlayground } from "../../shared/state/actions";
import { resolveParameter, resolveSchema } from "../spec/ref-resolver";
import { buildUrl, resolveServerUrl, getRequestBodyExample, schemaToExample } from "../spec/example-gen";
import ServerConfig from "../server/ServerConfig";
import type { FieldSpec } from "./FieldSpec";
import ParamField from "./ParamField";
import SendBar from "./SendBar";
import AuthStatus from "./AuthStatus";
import BodyEditor from "./BodyEditor";
import ResponsePanel from "./ResponsePanel";
import VerticalResizable from "../../shared/components/VerticalResizable";
import { slot, type ThemeSlot } from "../../themes/slot";
import type { ThemeMode } from "../../themes/types";
import { useThemeMode } from "../../shared/contexts/theme-mode-context";

export interface PlaygroundTheme {
  container:           ThemeSlot;
  header:              ThemeSlot;
  headerTitle:         ThemeSlot;
  emptyState:          ThemeSlot;
  emptyIconWrapper:    ThemeSlot;
  emptyIcon:           ThemeSlot;
  emptyText:           ThemeSlot;
  inputLabel:          ThemeSlot;
  textInput:           ThemeSlot; // variants: focused, error, disabled
  selectInput:         ThemeSlot; // variants: focused, error
  fileInput:           ThemeSlot;
  fileInputButton:     ThemeSlot; // variants: hasFile
  bodyEditor:          ThemeSlot; // variants: focused
  contentTypeSelector: ThemeSlot;
  sendButton:          ThemeSlot; // variants: loading, disabled
  responsePanel:       ThemeSlot;
  responseStatus:      ThemeSlot; // variants: success, redirect, clientError, serverError
  responseTime:        ThemeSlot;
  responseSize:        ThemeSlot;
  responseTabs:        ThemeSlot;
  responseTab:         ThemeSlot; // variants: active
  responseBody:        ThemeSlot;
  responseEmpty:       ThemeSlot;
  errorBanner:         ThemeSlot;
}

export const playgroundTheme: Record<ThemeMode, PlaygroundTheme> = {
  default: {
    container:           'h-full flex flex-col bg-white',
    header:              'flex items-center gap-2 px-5 border-b border-gray-100 shrink-0 h-[50px]',
    headerTitle:         'text-xs font-semibold text-gray-700',
    emptyState:          'h-full flex flex-col items-center justify-center text-center px-6 gap-3 bg-white',
    emptyIconWrapper:    'w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center',
    emptyIcon:           'w-5 h-5 text-gray-400',
    emptyText:           'text-sm text-gray-400',
    inputLabel:          'text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3',
    textInput:           'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
    selectInput:         'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer transition-colors',
    fileInput:           'block w-full text-xs text-gray-600 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100',
    fileInputButton:     { base: 'file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100', hasFile: 'file:bg-blue-100' },
    bodyEditor:          'w-full text-[11px] border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono resize-y transition-colors leading-relaxed',
    contentTypeSelector: 'text-[10px] font-mono text-gray-500 border border-gray-200 rounded px-2 py-0.5 bg-gray-50',
    sendButton:          { base: 'shrink-0 px-4 rounded-lg text-xs font-semibold transition-all bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm', loading: 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none', disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' },
    responsePanel:       'h-full border-t border-gray-100 flex flex-col',
    responseStatus:      { base: 'text-[10px] rounded px-1.5 py-0.5 font-mono font-semibold border bg-gray-50 text-gray-600 border-gray-200', success: 'bg-green-50 text-green-600 border-green-200', redirect: 'bg-blue-50 text-blue-600 border-blue-200', clientError: 'bg-amber-50 text-amber-600 border-amber-200', serverError: 'bg-red-50 text-red-600 border-red-200' },
    responseTime:        'text-[10px] text-gray-400 font-mono border border-gray-200 rounded px-1.5 py-0.5',
    responseSize:        'text-[10px] text-gray-400 font-mono',
    responseTabs:        'flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50 shrink-0',
    responseTab:         { base: 'px-2.5 py-1 text-[10px] rounded font-medium transition-colors text-gray-400 hover:text-gray-600', active: 'bg-white shadow-sm text-gray-700 border border-gray-200' },
    responseBody:        'flex-1 overflow-auto bg-white',
    responseEmpty:       'shrink-0 border-t border-gray-100 h-10 flex items-center justify-center text-[10px] text-gray-300',
    errorBanner:         'mx-5 mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600',
  },
  dark: {
    container:           'h-full flex flex-col bg-gray-900',
    header:              'flex items-center gap-2 px-5 border-b border-gray-700 shrink-0 h-[50px]',
    headerTitle:         'text-xs font-semibold text-gray-300',
    emptyState:          'h-full flex flex-col items-center justify-center text-center px-6 gap-3 bg-gray-900',
    emptyIconWrapper:    'w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center',
    emptyIcon:           'w-5 h-5 text-gray-500',
    emptyText:           'text-sm text-gray-500',
    inputLabel:          'text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3',
    textInput:           'w-full text-xs border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
    selectInput:         'w-full text-xs border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer transition-colors',
    fileInput:           'block w-full text-xs text-gray-400 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-900/40 file:text-blue-400 hover:file:bg-blue-900/60',
    fileInputButton:     { base: 'file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-900/40 file:text-blue-400 hover:file:bg-blue-900/60', hasFile: 'file:bg-blue-900/60' },
    bodyEditor:          'w-full text-[11px] border border-gray-600 rounded-lg px-3 py-2.5 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono resize-y transition-colors leading-relaxed',
    contentTypeSelector: 'text-[10px] font-mono text-gray-400 border border-gray-600 rounded px-2 py-0.5 bg-gray-700',
    sendButton:          { base: 'shrink-0 px-4 rounded-lg text-xs font-semibold transition-all bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm', loading: 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none', disabled: 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none' },
    responsePanel:       'h-full border-t border-gray-700 flex flex-col',
    responseStatus:      { base: 'text-[10px] rounded px-1.5 py-0.5 font-mono font-semibold border bg-gray-800 text-gray-400 border-gray-600', success: 'bg-green-900/30 text-green-400 border-green-700', redirect: 'bg-blue-900/30 text-blue-400 border-blue-700', clientError: 'bg-amber-900/30 text-amber-400 border-amber-700', serverError: 'bg-red-900/30 text-red-400 border-red-700' },
    responseTime:        'text-[10px] text-gray-500 font-mono border border-gray-600 rounded px-1.5 py-0.5',
    responseSize:        'text-[10px] text-gray-500 font-mono',
    responseTabs:        'flex items-center gap-2 px-4 py-2 border-b border-gray-700 bg-gray-800/30 shrink-0',
    responseTab:         { base: 'px-2.5 py-1 text-[10px] rounded font-medium transition-colors text-gray-500 hover:text-gray-300', active: 'bg-gray-700 shadow-sm text-gray-200 border border-gray-600' },
    responseBody:        'flex-1 overflow-auto bg-gray-900',
    responseEmpty:       'shrink-0 border-t border-gray-700 h-10 flex items-center justify-center text-[10px] text-gray-600',
    errorBanner:         'mx-5 mb-4 px-3 py-2 bg-red-900/30 border border-red-700 rounded-lg text-xs text-red-400',
  },
};

/**
 * Converts a resolved Parameter into a FieldSpec, lifting schema fields to the top level.
 * Parameter-level fields (deprecated, description, example) take precedence over schema-level ones.
 */
function toFieldSpec(param: ReturnType<typeof resolveParameter>): FieldSpec {
  const s = param.schema;
  return {
    name:       param.name,
    location:   param.in as FieldSpec["location"],
    required:   param.in === "path" || !!param.required,
    deprecated: param.deprecated,
    description: param.description,
    type:       s?.type as FieldSpec["type"],
    format:     s?.format,
    enum:       s?.enum,
    items:      s?.items ? { type: s.items.type, format: s.items.format, enum: s.items.enum } : undefined,
    style:      param.style,
    explode:    param.explode,
    minimum:    s?.minimum,
    maximum:    s?.maximum,
    minLength:  s?.minLength,
    maxLength:  s?.maxLength,
    pattern:    s?.pattern,
    default:    s?.default,
    example:    s?.example ?? param.example,
  };
}

/**
 * Converts a multipart/form-data schema property into a FieldSpec.
 * Resolves $refs in both the property schema and its items.
 */
function toMultipartFieldSpec(
  name: string,
  prop: Schema,
  required: boolean,
  components: Components | undefined,
): FieldSpec {
  const resolved = resolveSchema(prop, components);
  const items    = resolved?.items ? resolveSchema(resolved.items, components) : undefined;
  return {
    name,
    location:    "form",
    required,
    description: resolved?.description,
    type:        resolved?.type as FieldSpec["type"],
    format:      resolved?.format,
    items:       items ? { type: items.type, format: items.format, enum: items.enum } : undefined,
    minimum:     resolved?.minimum,
    maximum:     resolved?.maximum,
    minLength:   resolved?.minLength,
    maxLength:   resolved?.maxLength,
    pattern:     resolved?.pattern,
    default:     resolved?.default,
    example:     resolved?.example,
  };
}

interface PlaygroundFormProps {
  schemeNames: string[] | null;
  allSchemes: Record<string, SecurityScheme>;
  authValues: AuthValues;
  hasParams: boolean;
  paramFields: FieldSpec[];
  paramValues: Record<string, string>;
  invalidFields: Set<string>;
  onParamChange: (name: string, value: string) => void;
  onFileChange: (name: string, files: FileList, multiple: boolean) => void;
  multipartFields: FieldSpec[];
  bodyParams: Record<string, string>;
  onBodyParamChange: (name: string, value: string) => void;
  op: Operation | undefined;
  bodyContentType: string;
  bodyValue: string;
  onBodyChange: (value: string) => void;
  onRawFile: (file: File) => void;
}

/** Form area of the playground: auth status, parameters, and request body editor. */
function PlaygroundForm({
  schemeNames, allSchemes, authValues,
  hasParams, paramFields, paramValues, invalidFields, onParamChange, onFileChange,
  multipartFields, bodyParams, onBodyParamChange,
  op, bodyContentType, bodyValue, onBodyChange, onRawFile,
}: PlaygroundFormProps) {
  const t = playgroundTheme[useThemeMode()];
  return (
    <div className="px-5 py-6 flex flex-col gap-7">
      <AuthStatus
        schemeNames={schemeNames}
        allSchemes={allSchemes}
        authValues={authValues}
      />

      {hasParams && (
        <div>
          <p className={slot(t.inputLabel)}>Parameters</p>
          <div className="flex flex-col gap-4">
            {paramFields.map(f => (
              <ParamField
                key={`${f.location}:${f.name}`}
                field={f}
                value={paramValues[f.name] ?? ""}
                invalid={invalidFields.has(f.name)}
                onChange={onParamChange}
                onFileChange={onFileChange}
              />
            ))}
            {multipartFields.map(f => (
              <ParamField
                key={f.name}
                field={f}
                value={bodyParams[f.name] ?? ""}
                invalid={invalidFields.has(f.name)}
                onChange={onBodyParamChange}
                onFileChange={onFileChange}
              />
            ))}
          </div>
        </div>
      )}

      {op?.requestBody && bodyContentType !== "multipart/form-data" && (
        <BodyEditor
          required={!!op.requestBody.required}
          contentType={bodyContentType}
          bodyValue={bodyValue}
          onBodyChange={onBodyChange}
          onRawFile={onRawFile}
        />
      )}
    </div>
  );
}

/** Renders the try-it-out panel. Delegates all rendering to focused sub-components. */
export default function Playground() {
  const { endpoint, paramValues, bodyValue, bodyParams, fileValues, response, loading,
          setParamValues, setBodyValue, setBodyParams, setFileValues } = usePlayground();
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const { spec }                          = useSpec();
  const { authValues }                    = useAuth();
  const { selectedServer, serverVariables } = useServer();

  const components = spec?.components;
  const op         = endpoint?.operation;

  const params = useMemo(
    () => (op?.parameters ?? []).map(p => resolveParameter(p, components)),
    [op, components],
  );

  const servers      = spec?.servers ?? [{ url: "http://localhost" }];
  const activeServer = servers.find(s => s.url === selectedServer) ?? servers[0];
  const resolvedBase = activeServer
    ? resolveServerUrl(activeServer, serverVariables)
    : (servers[0]?.url ?? "http://localhost");

  const resolvedUrl = endpoint ? buildUrl(resolvedBase, endpoint.path, paramValues, params) : "";
  const canExecute  = !!endpoint && params.filter(p => p.in === "path").every(p => !p.required || paramValues[p.name]);

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

  // Pre-fill body with example when endpoint changes and body is still empty.
  useEffect(() => {
    if (!endpoint || bodyValue) return;
    const example = getRequestBodyExample(endpoint, spec?.components);
    if (example) setBodyValue(example);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  // Pre-fill param defaults and object examples when endpoint changes.
  useEffect(() => {
    if (!endpoint) return;
    const defaults: Record<string, string> = {};
    for (const p of params) {
      if (p.name in paramValues) continue;
      if (p.schema?.default !== undefined) {
        defaults[p.name] = String(p.schema.default);
      } else if (p.schema?.type === "object") {
        const example = schemaToExample(p.schema, components);
        if (example !== null) defaults[p.name] = JSON.stringify(example, null, 2);
      }
    }
    if (Object.keys(defaults).length) setParamValues({ ...paramValues, ...defaults });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const schemeNames = useMemo((): string[] | null => {
    if (!endpoint || !spec) return null;
    const opSec = endpoint.operation.security;
    if (opSec !== undefined) return opSec.length === 0 ? [] : opSec.flatMap(r => Object.keys(r));
    if (spec.security !== undefined) return spec.security.length === 0 ? [] : spec.security.flatMap(r => Object.keys(r));
    const keys = Object.keys(spec.components?.securitySchemes ?? {});
    return keys.length ? keys : null;
  }, [endpoint, spec]);

  const paramFields = useMemo(() => params.map(toFieldSpec), [params]);

  const requiredSet     = useMemo(() => new Set(multipartSchema?.required ?? []), [multipartSchema]);
  const multipartFields = useMemo(
    () => bodyContentType === "multipart/form-data" && multipartSchema?.properties
      ? Object.entries(multipartSchema.properties).map(([n, prop]) =>
          toMultipartFieldSpec(n, prop, requiredSet.has(n), components))
      : [],
    [bodyContentType, multipartSchema, requiredSet, components],
  );

  function validateField(field: FieldSpec, value: string): boolean {
    if (!value) return true;
    const isNumeric = field.type === "integer" || field.type === "number";
    if (isNumeric) {
      const n = Number(value);
      if (field.minimum !== undefined && n < field.minimum) return false;
      if (field.maximum !== undefined && n > field.maximum) return false;
    }
    if (field.type === "string") {
      if (field.minLength !== undefined && value.length < field.minLength) return false;
      if (field.maxLength !== undefined && value.length > field.maxLength) return false;
      if (field.pattern && !new RegExp(field.pattern).test(value)) return false;
    }
    return true;
  }

  function handleSend() {
    const allFields = [...paramFields, ...multipartFields];
    const allValues = { ...paramValues, ...bodyParams };
    const bad = new Set<string>();
    for (const field of allFields) {
      if (!validateField(field, allValues[field.name] ?? "")) bad.add(field.name);
    }
    if (bad.size > 0) { setInvalidFields(bad); return; }
    setInvalidFields(new Set());
    executePlayground();
  }

  function setParam(name: string, value: string) {
    setParamValues({ ...paramValues, [name]: value });
    if (invalidFields.has(name)) setInvalidFields(prev => { const s = new Set(prev); s.delete(name); return s; });
  }
  function setBodyParam(name: string, value: string) {
    setBodyParams({ ...bodyParams, [name]: value });
    if (invalidFields.has(name)) setInvalidFields(prev => { const s = new Set(prev); s.delete(name); return s; });
  }
  function setFileField(name: string, files: FileList, multiple: boolean) {
    setFileValues({ ...fileValues, [name]: multiple ? Array.from(files) : files[0] });
  }

  const t = playgroundTheme[useThemeMode()];

  if (!endpoint) {
    return (
      <div className={slot(t.emptyState)}>
        <div className={slot(t.emptyIconWrapper)}>
          <svg className={slot(t.emptyIcon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <p className={slot(t.emptyText)}>Select an endpoint to use the playground</p>
      </div>
    );
  }

  const hasParams = paramFields.length > 0 || multipartFields.length > 0;

  return (
    <div className={slot(t.container)}>

      <div className={slot(t.header)}>
        <span className={slot(t.headerTitle)}>Playground</span>
        <div className="flex-1" />
        <ServerConfig source="playground" />
      </div>

      <SendBar
        endpoint={endpoint}
        resolvedUrl={resolvedUrl}
        canExecute={canExecute}
        loading={loading}
        onSend={handleSend}
      />

      <VerticalResizable
        storageKey="try-pane-split"
        defaultBottomHeight={280}
        minTop={120}
        minBottom={80}
        top={
          <PlaygroundForm
            schemeNames={schemeNames}
            allSchemes={spec?.components?.securitySchemes ?? {}}
            authValues={authValues}
            hasParams={hasParams}
            paramFields={paramFields}
            paramValues={paramValues}
            invalidFields={invalidFields}
            onParamChange={setParam}
            onFileChange={setFileField}
            multipartFields={multipartFields}
            bodyParams={bodyParams}
            onBodyParamChange={setBodyParam}
            op={op}
            bodyContentType={bodyContentType}
            bodyValue={bodyValue}
            onBodyChange={setBodyValue}
            onRawFile={(file) => setFileValues({ ...fileValues, __raw__: file })}
          />
        }
        bottom={<ResponsePanel loading={loading} response={response} />}
      />

    </div>
  );
}