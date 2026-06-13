import type {HttpMethod, OpenAPISpec, Parameter, PathItem, TagGroup} from "./openapi";

const HTTP_METHODS: HttpMethod[] = ["get", "post", "put", "delete", "patch", "options", "head"];

// Operation-level parameters override path-level ones with the same name+in.
// $ref parameters at path level are always included (can't compare without resolving).
function mergeParameters(pathParams: Parameter[], opParams: Parameter[]): Parameter[] {
    const opKeys = new Set(
        opParams
            .filter((p) => !("$ref" in p))
            .map((p) => `${p.name}::${p.in}`)
    );
    const uniquePathParams = pathParams.filter((p) => "$ref" in p || !opKeys.has(`${p.name}::${p.in}`));
    return [...uniquePathParams, ...opParams];
}

export function parseSpec(spec: OpenAPISpec): TagGroup[] {
    const groupMap = new Map<string, TagGroup>();

    if (spec.tags) {
        for (const tag of spec.tags) {
            groupMap.set(tag.name, {name: tag.name, description: tag.description, endpoints: []});
        }
    }

    for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
        const pi = pathItem as PathItem;
        for (const method of HTTP_METHODS) {
            const operation = pi[method];
            if (!operation) continue;

            const tags = operation.tags?.length ? operation.tags : ["default"];
            const primaryTag = tags[0];

            if (!groupMap.has(primaryTag)) {
                groupMap.set(primaryTag, {name: primaryTag, endpoints: []});
            }

            const parameters = mergeParameters(pi.parameters ?? [], operation.parameters ?? []);
            groupMap.get(primaryTag)!.endpoints.push({
                method,
                path,
                operation: {...operation, parameters},
                tag: primaryTag,
            });
        }
    }

    return Array.from(groupMap.values()).filter((g) => g.endpoints.length > 0);
}