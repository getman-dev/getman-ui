import type {Components, EndpointEntry, Parameter, Response, Schema, Server} from "./openapi";
import {resolveSchema} from "./ref-resolver";

/**
 * Resolves a server URL template by substituting `{variable}` placeholders
 * with values from `variables`, falling back to the variable's declared default.
 */
export function resolveServerUrl(server: Server, variables: Record<string, string>): string {
    return server.url.replace(/\{([^}]+)\}/g, (_, name: string) =>
        variables[name] ?? server.variables?.[name]?.default ?? name
    );
}

export function schemaToExample(
    schema: Schema | undefined,
    components: Components | undefined,
    depth = 0
): unknown {
    if (depth > 4) return null;
    const resolved = resolveSchema(schema, components);
    if (!resolved) return null;

    if (resolved.example !== undefined) return resolved.example;

    if (resolved.allOf?.length) return schemaToExample(resolved.allOf[0], components, depth + 1);
    if (resolved.oneOf?.length) return schemaToExample(resolved.oneOf[0], components, depth + 1);
    if (resolved.anyOf?.length) return schemaToExample(resolved.anyOf[0], components, depth + 1);
    if (resolved.enum?.length) return resolved.enum[0];

    switch (resolved.type) {
        case "object": {
            const obj: Record<string, unknown> = {};
            if (resolved.properties) {
                for (const [key, prop] of Object.entries(resolved.properties)) {
                    obj[key] = schemaToExample(prop, components, depth + 1);
                }
            }
            return obj;
        }
        case "array":
            return [schemaToExample(resolved.items, components, depth + 1)];
        case "string":
            if (resolved.format === "date-time") return new Date().toISOString();
            if (resolved.format === "date") return new Date().toISOString().slice(0, 10);
            if (resolved.format === "uuid") return "3fa85f64-5717-4562-b3fc-2c963f66afa6";
            if (resolved.format === "email") return "user@example.com";
            if (resolved.format === "uri") return "https://example.com";
            return resolved.default as string ?? "string";
        case "integer":
        case "number":
            return resolved.default as number ?? (resolved.minimum ?? 0);
        case "boolean":
            return resolved.default as boolean ?? false;
        default:
            return null;
    }
}

export function getRequestBodyExample(
    endpoint: EndpointEntry,
    components: Components | undefined
): string {
    const rb = endpoint.operation.requestBody;
    if (!rb) return "";

    const jsonMedia = rb.content?.["application/json"];
    if (!jsonMedia) return "";

    if (jsonMedia.example !== undefined) return JSON.stringify(jsonMedia.example, null, 2);

    if (jsonMedia.examples) {
        const first = Object.values(jsonMedia.examples)[0];
        if (first?.value !== undefined) return JSON.stringify(first.value, null, 2);
    }

    const example = schemaToExample(jsonMedia.schema, components);
    return example !== null ? JSON.stringify(example, null, 2) : "";
}

export function getSuccessResponse(responses: Record<string, Response>): [string, Response] | null {
    for (const code of ["200", "201", "202", "204"]) {
        if (responses[code]) return [code, responses[code]];
    }
    const first = Object.entries(responses)[0];
    return first ?? null;
}

export function getResponseExample(
    response: Response,
    components: Components | undefined
): string | null {
    const content = response.content ?? {};
    const jsonMedia = content["application/json"] ?? content["*/*"] ?? Object.values(content)[0];
    if (!jsonMedia) return null;

    if (jsonMedia.example !== undefined) return JSON.stringify(jsonMedia.example, null, 2);

    if (jsonMedia.examples) {
        const first = Object.values(jsonMedia.examples)[0];
        if (first?.value !== undefined) return JSON.stringify(first.value, null, 2);
    }

    const example = schemaToExample(jsonMedia.schema, components);
    return example !== null ? JSON.stringify(example, null, 2) : null;
}

/** Serializes a single query parameter's value(s) into `name=val` pair(s) per OpenAPI style/explode rules. */
function serializeQueryParam(param: Parameter, raw: string): string {
    const enc = encodeURIComponent;
    const isArray = param.schema?.type === "array";
    const isObject = param.schema?.type === "object";

    if (isObject) {
        let parsed: Record<string, unknown>;
        try {
            parsed = JSON.parse(raw) as Record<string, unknown>;
        } catch {
            return `${enc(param.name)}=${enc(raw)}`;
        }
        const style = param.style ?? "form";
        const entries = Object.entries(parsed).filter(([, v]) => v !== null && v !== undefined && v !== "");
        if (style === "deepObject") {
            // deepObject: filter[color]=red&filter[size]=M
            return entries.map(([k, v]) => `${enc(param.name)}[${enc(k)}]=${enc(String(v))}`).join("&");
        }
        // explode defaults to true for "form", false otherwise
        const explode = param.explode ?? (style === "form");
        if (explode) {
            // form + explode: color=red&size=M (each key is its own param)
            return entries.map(([k, v]) => `${enc(k)}=${enc(String(v))}`).join("&");
        }
        // form + no explode: filter=color,red,size,M
        const flat = entries.flatMap(([k, v]) => [enc(k), enc(String(v))]);
        return `${enc(param.name)}=${flat.join(",")}`;
    }

    if (!isArray) return `${enc(param.name)}=${enc(raw)}`;

    const items = raw.split("\n").filter(Boolean);
    if (!items.length) return "";

    const style = param.style ?? "form";
    // explode defaults to true for "form", false for everything else
    const explode = param.explode ?? (style === "form");

    if (explode) {
        return items.map(v => `${enc(param.name)}=${enc(v)}`).join("&");
    }
    const delimiter = style === "spaceDelimited" ? "%20"
        : style === "pipeDelimited" ? "|"
            : ",";
    const joined = items.map(enc).join(delimiter);
    return `${enc(param.name)}=${joined}`;
}

export function buildUrl(
    baseUrl: string,
    path: string,
    paramValues: Record<string, string>,
    parameters: Parameter[]
): string {
    let url = baseUrl.replace(/\/$/, "") + path;

    url = url.replace(/\{(\w+)\}/g, (_, name) => {
        return encodeURIComponent(paramValues[name] ?? `{${name}}`);
    });

    const queryParams = parameters.filter((p) => p.in === "query" && paramValues[p.name]);
    if (queryParams.length) {
        const parts = queryParams
            .map(p => serializeQueryParam(p, paramValues[p.name]))
            .filter(Boolean);
        if (parts.length) url += `?${parts.join("&")}`;
    }

    return url;
}