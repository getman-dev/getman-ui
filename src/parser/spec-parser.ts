import type { OpenAPISpec, TagGroup, HttpMethod, PathItem } from "../types/openapi";

const HTTP_METHODS: HttpMethod[] = ["get", "post", "put", "delete", "patch", "options", "head"];

export function parseSpec(spec: OpenAPISpec): TagGroup[] {
  const groupMap = new Map<string, TagGroup>();

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

      groupMap.get(primaryTag)!.endpoints.push({ method, path, operation, tag: primaryTag });
    }
  }

  return Array.from(groupMap.values()).filter((g) => g.endpoints.length > 0);
}