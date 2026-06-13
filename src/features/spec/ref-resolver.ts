import type {Components, Parameter, Response, Schema} from "./openapi";

export function resolveRef<T>(ref: string, components: Components | undefined): T | null {
    if (!ref.startsWith("#/")) return null;
    const parts = ref.slice(2).split("/");
    let current: unknown = {components};
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

export function resolveResponse(response: Response, components: Components | undefined): Response {
    if ((response as { $ref?: string }).$ref) {
        const resolved = resolveRef<Response>((response as unknown as { $ref: string }).$ref, components);
        return resolved ?? response;
    }
    return response;
}