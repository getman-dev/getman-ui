/** Try-it-out panel: normalises parameters to FieldSpec and orchestrates sub-components. */
import {useEffect, useMemo, useState} from "react";
import type {AuthValues, Components, Operation, Schema, SecurityScheme} from "../spec/openapi";
import {usePlayground} from "./playground-context";
import {useSpec} from "../spec/spec-context";
import {useAuth} from "../auth/auth-context";
import {useServer} from "../server/server-context";
import {executePlayground} from "../../shared/state/actions";
import {resolveParameter, resolveSchema} from "../spec/ref-resolver";
import {buildUrl, getRequestBodyExample, resolveServerUrl, schemaToExample} from "../spec/example-gen";
import ServerConfig from "../server/ServerConfig";
import type {FieldSpec} from "./FieldSpec";
import ParamField from "./ParamField";
import SendBar from "./SendBar";
import AuthStatus from "./AuthStatus";
import BodyEditor from "./BodyEditor";
import ResponsePanel from "./ResponsePanel";
import VerticalResizable from "../../shared/components/VerticalResizable";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface PlaygroundTheme {
    container: ThemeSlot;
    header: ThemeSlot;
    headerTitle: ThemeSlot;
    emptyState: ThemeSlot;
    emptyIconWrapper: ThemeSlot;
    emptyIcon: ThemeSlot;
    emptyText: ThemeSlot;
    inputLabel: ThemeSlot;
    textInput: ThemeSlot;
    selectInput: ThemeSlot;
    fileInput: ThemeSlot;
    fileInputButton: ThemeSlot; // variants: hasFile
    bodyEditor: ThemeSlot;
    contentTypeSelector: ThemeSlot;
    sendButton: ThemeSlot; // variants: loading, disabled
    responsePanel: ThemeSlot;
    responseStatus: ThemeSlot; // variants: success, redirect, clientError, serverError
    responseTime: ThemeSlot;
    responseSize: ThemeSlot;
    responseTabs: ThemeSlot;
    responseTab: ThemeSlot; // variants: active
    responseBody: ThemeSlot;
    responseEmpty: ThemeSlot;
    errorBanner: ThemeSlot;
}

/**
 * Converts a resolved Parameter into a FieldSpec, lifting schema fields to the top level.
 * Parameter-level fields (deprecated, description, example) take precedence over schema-level ones.
 */
function toFieldSpec(param: ReturnType<typeof resolveParameter>): FieldSpec {
    const s = param.schema;
    return {
        name: param.name,
        location: param.in as FieldSpec["location"],
        required: param.in === "path" || !!param.required,
        deprecated: param.deprecated,
        description: param.description,
        type: s?.type as FieldSpec["type"],
        format: s?.format,
        enum: s?.enum,
        items: s?.items ? {type: s.items.type, format: s.items.format, enum: s.items.enum} : undefined,
        style: param.style,
        explode: param.explode,
        minimum: s?.minimum,
        maximum: s?.maximum,
        minLength: s?.minLength,
        maxLength: s?.maxLength,
        pattern: s?.pattern,
        default: s?.default,
        example: s?.example ?? param.example,
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
    const items = resolved?.items ? resolveSchema(resolved.items, components) : undefined;
    return {
        name,
        location: "form",
        required,
        description: resolved?.description,
        type: resolved?.type as FieldSpec["type"],
        format: resolved?.format,
        items: items ? {type: items.type, format: items.format, enum: items.enum} : undefined,
        minimum: resolved?.minimum,
        maximum: resolved?.maximum,
        minLength: resolved?.minLength,
        maxLength: resolved?.maxLength,
        pattern: resolved?.pattern,
        default: resolved?.default,
        example: resolved?.example,
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
    const t = useTheme().playground;
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
    const {
        endpoint, paramValues, bodyValue, bodyParams, fileValues, response, loading,
        setParamValues, setBodyValue, setBodyParams, setFileValues
    } = usePlayground();
    const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
    const {spec} = useSpec();
    const {authValues} = useAuth();
    const {selectedServer, serverVariables} = useServer();
    const t = useTheme().playground;

    const components = spec?.components;
    const op = endpoint?.operation;

    const params = useMemo(
        () => (op?.parameters ?? []).map(p => resolveParameter(p, components)),
        [op, components],
    );

    const servers = spec?.servers ?? [{url: "http://localhost"}];
    const activeServer = servers.find(s => s.url === selectedServer) ?? servers[0];
    const resolvedBase = activeServer
        ? resolveServerUrl(activeServer, serverVariables)
        : (servers[0]?.url ?? "http://localhost");

    const resolvedUrl = endpoint ? buildUrl(resolvedBase, endpoint.path, paramValues, params) : "";
    const canExecute = !!endpoint && params.filter(p => p.in === "path").every(p => !p.required || paramValues[p.name]);

    const bodyContentType = useMemo((): string => {
        if (!op) return "application/json";
        const content = op.requestBody?.content ?? {};
        if ("multipart/form-data" in content) return "multipart/form-data";
        if ("application/octet-stream" in content) return "application/octet-stream";
        if ("application/json" in content) return "application/json";
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
        if (Object.keys(defaults).length) setParamValues({...paramValues, ...defaults});
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

    const requiredSet = useMemo(() => new Set(multipartSchema?.required ?? []), [multipartSchema]);
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
        const allValues = {...paramValues, ...bodyParams};
        const bad = new Set<string>();
        for (const field of allFields) {
            if (!validateField(field, allValues[field.name] ?? "")) bad.add(field.name);
        }
        if (bad.size > 0) {
            setInvalidFields(bad);
            return;
        }
        setInvalidFields(new Set());
        executePlayground();
    }

    function setParam(name: string, value: string) {
        setParamValues({...paramValues, [name]: value});
        if (invalidFields.has(name)) setInvalidFields(prev => {
            const s = new Set(prev);
            s.delete(name);
            return s;
        });
    }

    function setBodyParam(name: string, value: string) {
        setBodyParams({...bodyParams, [name]: value});
        if (invalidFields.has(name)) setInvalidFields(prev => {
            const s = new Set(prev);
            s.delete(name);
            return s;
        });
    }

    function setFileField(name: string, files: FileList, multiple: boolean) {
        setFileValues({...fileValues, [name]: multiple ? Array.from(files) : files[0]});
    }

    if (!endpoint) {
        return (
            <div className={slot(t.emptyState)}>
                <div className={slot(t.emptyIconWrapper)}>
                    <svg className={slot(t.emptyIcon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M13 10V3L4 14h7v7l9-11h-7z"/>
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
                <div className="flex-1"/>
                <ServerConfig source="playground"/>
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
                        onRawFile={(file) => setFileValues({...fileValues, __raw__: file})}
                    />
                }
                bottom={<ResponsePanel loading={loading} response={response}/>}
            />

        </div>
    );
}