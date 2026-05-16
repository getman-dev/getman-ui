/** Owns the parsed OpenAPI spec and derived tag groups. */
import type { OpenAPISpec, TagGroup } from "../types/openapi";

function createSpecState() {
  let spec: OpenAPISpec | null = null;
  let groups: TagGroup[] = [];
  const subs = new Set<() => void>();
  const notify = () => subs.forEach(fn => fn());

  return {
    get spec()   { return spec; },
    get groups() { return groups; },
    load(newSpec: OpenAPISpec, newGroups: TagGroup[]) { spec = newSpec; groups = newGroups; notify(); },
    clear()                                           { spec = null; groups = []; notify(); },
    sub(fn: () => void) { subs.add(fn); return () => subs.delete(fn); },
  };
}

export const specState = createSpecState();