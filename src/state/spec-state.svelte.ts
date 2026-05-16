/** Owns the parsed OpenAPI spec and derived tag groups. */
import type { OpenAPISpec, TagGroup } from "../types/openapi";

export const specState = $state({
  spec: null as OpenAPISpec | null,
  groups: [] as TagGroup[],
});