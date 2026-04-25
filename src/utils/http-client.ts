import type { EndpointEntry, TryItResponse, Components, AuthValues, SecurityScheme } from "../types/openapi";
import { resolveParameter, buildUrl } from "../parser/spec-parser";

// ─── Execute a real HTTP request ──────────────────────────────────────────────

export async function executeRequest(
  endpoint: EndpointEntry,
  paramValues: Record<string, string>,
  bodyValue: string,
  baseUrl: string,
  components: Components | undefined,
  authValues?: AuthValues
): Promise<TryItResponse> {
  const params = (endpoint.operation.parameters ?? []).map((p) =>
    resolveParameter(p, components)
  );
  const securitySchemes = components?.securitySchemes ?? {};

  let url = buildUrl(baseUrl, endpoint.path, paramValues, params);

  const headers: Record<string, string> = {};

  if (authValues) {
    const queryExtras: string[] = [];
    for (const [schemeName, val] of Object.entries(authValues)) {
      const scheme: SecurityScheme | undefined = securitySchemes[schemeName];
      if (!scheme) continue;

      if (scheme.type === "apiKey" && scheme.name) {
        if (scheme.in === "header" && val.value) {
          headers[scheme.name] = val.value;
        } else if (scheme.in === "query" && val.value) {
          queryExtras.push(`${encodeURIComponent(scheme.name)}=${encodeURIComponent(val.value)}`);
        }
      } else if (scheme.type === "http") {
        if (scheme.scheme?.toLowerCase() === "basic" && (val.username || val.password)) {
          headers["Authorization"] = `Basic ${btoa(`${val.username}:${val.password}`)}`;
        } else if (val.value) {
          headers["Authorization"] = `Bearer ${val.value}`;
        }
      } else if ((scheme.type === "oauth2" || scheme.type === "openIdConnect") && val.value) {
        headers["Authorization"] = `Bearer ${val.value}`;
      }
    }
    if (queryExtras.length) {
      url += (url.includes("?") ? "&" : "?") + queryExtras.join("&");
    }
  }

  const headerParams = params.filter((p) => p.in === "header" && paramValues[p.name]);
  for (const p of headerParams) {
    headers[p.name] = paramValues[p.name];
  }

  const hasBody = ["post", "put", "patch"].includes(endpoint.method);
  if (hasBody && bodyValue.trim()) {
    headers["Content-Type"] = "application/json";
  }

  const start = performance.now();

  const res = await fetch(url, {
    method: endpoint.method.toUpperCase(),
    headers,
    body: hasBody && bodyValue.trim() ? bodyValue : undefined,
    credentials: "omit",
  });

  const duration = Math.round(performance.now() - start);
  const bodyText = await res.text();

  const responseHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
    body: bodyText,
    duration,
  };
}

// ─── CORS-safe fetch with proxy fallback ──────────────────────────────────────
// When the target API doesn't allow CORS, requests will fail in the browser.
// You can swap this with a local proxy (e.g. vite dev server proxy config).

export function isCorsError(err: unknown): boolean {
  return (
    err instanceof TypeError &&
    (err.message.includes("Failed to fetch") ||
      err.message.includes("NetworkError") ||
      err.message.includes("CORS"))
  );
}
