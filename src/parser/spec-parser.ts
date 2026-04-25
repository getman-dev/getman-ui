import type {
  OpenAPISpec,
  TagGroup,
  EndpointEntry,
  HttpMethod,
  PathItem,
  Schema,
  Parameter,
  Response,
  Components,
} from "../types/openapi";

const HTTP_METHODS: HttpMethod[] = ["get", "post", "put", "delete", "patch", "options", "head"];

// ─── $ref resolver ────────────────────────────────────────────────────────────

export function resolveRef<T>(ref: string, components: Components | undefined): T | null {
  if (!ref.startsWith("#/")) return null;
  const parts = ref.slice(2).split("/");
  let current: unknown = { components };
  for (const part of parts) {
    if (current == null || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[part];
  }
  return current as T;
}

export function resolveSchema(schema: Schema | undefined, components: Components | undefined): Schema | null {
  if (!schema) return null;
  if (schema.$ref) {
    return resolveRef<Schema>(schema.$ref, components);
  }
  return schema;
}

export function resolveParameter(param: Parameter, components: Components | undefined): Parameter {
  if ((param as { $ref?: string }).$ref) {
    const resolved = resolveRef<Parameter>((param as unknown as { $ref: string }).$ref, components);
    return resolved ?? param;
  }
  return param;
}

// ─── Tag grouping ─────────────────────────────────────────────────────────────

export function parseSpec(spec: OpenAPISpec): TagGroup[] {
  const groupMap = new Map<string, TagGroup>();

  // Pre-populate tags from spec.tags to preserve order & descriptions
  if (spec.tags) {
    for (const tag of spec.tags) {
      groupMap.set(tag.name, { name: tag.name, description: tag.description, endpoints: [] });
    }
  }

  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const operation = (pathItem as PathItem)[method];
      if (!operation) continue;

      const tags = operation.tags?.length ? operation.tags : ["default"];
      const primaryTag = tags[0];

      if (!groupMap.has(primaryTag)) {
        groupMap.set(primaryTag, { name: primaryTag, endpoints: [] });
      }

      groupMap.get(primaryTag)!.endpoints.push({
        method,
        path,
        operation,
        tag: primaryTag,
      });
    }
  }

  return Array.from(groupMap.values()).filter((g) => g.endpoints.length > 0);
}

// ─── Schema → example value ───────────────────────────────────────────────────

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

// ─── Request body example ─────────────────────────────────────────────────────

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

// ─── Response status helpers ──────────────────────────────────────────────────

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

// ─── URL builder ──────────────────────────────────────────────────────────────

export function buildUrl(
  baseUrl: string,
  path: string,
  paramValues: Record<string, string>,
  parameters: Parameter[]
): string {
  let url = baseUrl.replace(/\/$/, "") + path;

  // Substitute path params
  url = url.replace(/\{(\w+)\}/g, (_, name) => {
    return encodeURIComponent(paramValues[name] ?? `{${name}}`);
  });

  // Append query params
  const queryParams = parameters.filter((p) => p.in === "query" && paramValues[p.name]);
  if (queryParams.length) {
    const qs = queryParams
      .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(paramValues[p.name])}`)
      .join("&");
    url += `?${qs}`;
  }

  return url;
}
