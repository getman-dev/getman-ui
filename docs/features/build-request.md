# Request Builder: Pure Request Shape Function

| Field         | Value                                    |
|---------------|------------------------------------------|
| **Status**    | Draft                                    |
| **Created**   | 2026-05-28                               |
| **Area**      | `src/shared/utils/`                      |
| **Test file** | `src/shared/utils/build-request.test.ts` |

---

## Summary

Extract all request-building logic from `executeRequest` into a new pure function `buildRequest` that returns a fully
serializable `RequestShape` — a plain object containing the URL, HTTP method, headers, cookies, and body descriptor
needed to make a fetch call. Because the output contains no browser globals (`File`, `FormData`, `Blob`), the function
can be imported and asserted against in a Node.js Vitest test suite without any mocking.

---

## Motivation

`executeRequest` in `http-client.ts` currently mixes request construction with the actual `fetch` call. Every
serialization decision — path substitution, query encoding, auth headers, body content-type — is buried inside one async
function that can only be exercised by making a real network request. The `deepObject` URL encoding bug (recently fixed
in `serializeQueryParam`) was only caught through manual browser testing. A pure builder would have caught it in
seconds.

Extracting a `buildRequest` function enables:

- Regression tests for every OpenAPI query serialization style (`form`, `deepObject`, `spaceDelimited`, `pipeDelimited`)
- Verification that each auth scheme produces the correct header or query string
- Confirmation that cookie params are identified and returned separately
- Validation that multipart field names and JSON bodies are assembled correctly
- A stable interface to drive a future "copy as cURL" feature

---

## Goals

- Extract all non-`fetch` logic from `executeRequest` into `buildRequest`
- Cover: URL (path substitution + query serialization), headers (parameter headers + auth), cookies (parameter cookies +
  auth), and body (JSON / multipart text fields / octet-stream)
- Return a fully serializable shape — no `File`, `FormData`, or `Blob` in the output
- Refactor `executeRequest` to call `buildRequest` and then apply raw `File` objects to `FormData` as a separate step
- Ship a Vitest test file that covers every combination in the test-case tables below

## Non-goals

- File binary content in the output shape — Node.js unit tests cannot inspect `File` contents without mocking; field
  names are sufficient for asserting that upload wiring is correct
- CORS handling — stays in `http-client.ts`
- Response parsing — stays in `executeRequest`
- UI changes — this is a pure utility refactor

---

## API Design

### `RequestShape`

```ts
/** The fully resolved, serializable description of an HTTP request. */
export interface RequestShape {
  url: string;
  method: string;
  /** Request headers derived from header params and auth schemes. */
  headers: Record<string, string>;
  /**
   * Cookie values derived from cookie params and apiKey-in-cookie auth schemes.
   * Browsers forbid JS from setting the `Cookie` header directly, so these
   * cannot be forwarded by executeRequest. They are returned for test
   * assertability and for a future "copy as cURL" feature.
   */
  cookies: Record<string, string>;
  body: RequestBodyShape;
}

export type RequestBodyShape =
  | { type: "json";         content: string }
  | { type: "multipart";    fields: Record<string, string>; fileFields: string[] }
  | { type: "octet-stream"; filename: string }
  | null;
```

**Design notes:**

- `cookies` is always present (possibly empty). The values come from two sources: OpenAPI `in: "cookie"` parameters, and
  `apiKey` security schemes with `in: "cookie"`. `executeRequest` logs a `console.warn` when `cookies` is non-empty,
  since browsers silently drop the `Cookie` header from `fetch`.
- `body.fileFields` lists multipart field names that have `File` objects attached. A test can assert which fields are
  wired up without needing the file content.
- `body.type === "octet-stream"` includes `filename` for assertability; the actual binary data stays in the `File` held
  by `executeRequest`.
- `body === null` for GET/HEAD or when no body content is present.

### `buildRequest` signature

```ts
export function buildRequest(
  endpoint:      EndpointEntry,
  paramValues:   Record<string, string>,
  bodyValue:     string,
  bodyParams:    Record<string, string>,
  fileFieldNames: string[],
  baseUrl:       string,
  components:    Components | undefined,
  authValues?:   AuthValues,
  rawFilename?:  string,
): RequestShape
```

`fileFieldNames` is `Object.keys(fileValues)` — derived by `executeRequest` before the call. The function never receives
`File` objects, making it 100% pure and runnable in Node.js.

---

## Test Cases

### URL — path parameters

| Case                        | Param setup            | Input value               | Expected fragment                           |
|-----------------------------|------------------------|---------------------------|---------------------------------------------|
| Single path param           | `{userId}`, `in: path` | `"42"`                    | `/users/42`                                 |
| Multiple path params        | `{org}/{repo}`         | `org="acme"`, `repo="ui"` | `/acme/ui`                                  |
| Missing required path param | `{id}`                 | `""`                      | `/users/{id}` (left as literal placeholder) |
| Special characters          | `{q}`                  | `"hello world"`           | `hello%20world`                             |

### URL — query parameters

| Case                            | `style`          | `explode` | `schema.type` | Input value                  | Expected query string                       |
|---------------------------------|------------------|-----------|---------------|------------------------------|---------------------------------------------|
| String, form (default)          | `form`           | `true`    | `string`      | `"active"`                   | `?status=active`                            |
| Array, form + explode (default) | `form`           | `true`    | `array`       | `"a\nb"`                     | `?tags=a&tags=b`                            |
| Array, form + no explode        | `form`           | `false`   | `array`       | `"a\nb"`                     | `?tags=a,b`                                 |
| Array, spaceDelimited           | `spaceDelimited` | `false`   | `array`       | `"1\n2"`                     | `?ids=1%202`                                |
| Array, pipeDelimited            | `pipeDelimited`  | `false`   | `array`       | `"1\n2"`                     | `?ids=1\|2`                                 |
| Object, deepObject              | `deepObject`     | —         | `object`      | `{"color":"red","size":"M"}` | `?filter%5Bcolor%5D=red&filter%5Bsize%5D=M` |
| Object, form + explode          | `form`           | `true`    | `object`      | `{"a":1}`                    | `?a=1`                                      |
| Object, form + no explode       | `form`           | `false`   | `object`      | `{"a":1,"b":2}`              | `?obj=a,1,b,2`                              |
| Empty value                     | any              | —         | any           | `""`                         | param omitted                               |
| Invalid JSON for object         | `deepObject`     | —         | `object`      | `"not json"`                 | raw value passed through                    |

### Headers

| Case                          | Source                                 | Expected                                       |
|-------------------------------|----------------------------------------|------------------------------------------------|
| `in: header` param            | `X-Custom-Header: foo`                 | `headers["X-Custom-Header"] === "foo"`         |
| `apiKey` scheme, `in: header` | scheme name `X-Api-Key`, value `"tok"` | `headers["X-Api-Key"] === "tok"`               |
| `http` basic auth             | `username: "u"`, `password: "p"`       | `headers["Authorization"] === "Basic dTpw"`    |
| `http` bearer auth            | `value: "abc123"`                      | `headers["Authorization"] === "Bearer abc123"` |
| `oauth2` token                | `value: "tok"`                         | `headers["Authorization"] === "Bearer tok"`    |
| `openIdConnect` token         | `value: "tok"`                         | `headers["Authorization"] === "Bearer tok"`    |
| Missing auth value            | any scheme, `value: ""`                | header omitted                                 |
| Scheme name not in spec       | any                                    | skipped silently                               |

### Query — auth extras

| Case                          | Source                               | Expected                       |
|-------------------------------|--------------------------------------|--------------------------------|
| `apiKey` scheme, `in: query`  | scheme name `api_key`, value `"tok"` | `?api_key=tok` appended to URL |
| Appended after existing query | `?status=active` already present     | `?status=active&api_key=tok`   |

### Cookies

| Case                          | Source                               | Expected                       |
|-------------------------------|--------------------------------------|--------------------------------|
| `in: cookie` param            | `session`, value `"abc"`             | `cookies["session"] === "abc"` |
| `apiKey` scheme, `in: cookie` | scheme name `api_key`, value `"tok"` | `cookies["api_key"] === "tok"` |
| Empty value                   | any                                  | key omitted from `cookies`     |

### Body

| Case                           | Content-type in spec       | Input                           | Expected `body`                                                    |
|--------------------------------|----------------------------|---------------------------------|--------------------------------------------------------------------|
| JSON body present              | `application/json`         | `'{"a":1}'`                     | `{ type: "json", content: '{"a":1}' }`                             |
| JSON body whitespace-only      | `application/json`         | `"  "`                          | `null`                                                             |
| JSON body empty string         | `application/json`         | `""`                            | `null`                                                             |
| Multipart text fields          | `multipart/form-data`      | `bodyParams: { name: "Alice" }` | `{ type: "multipart", fields: { name: "Alice" }, fileFields: [] }` |
| Multipart with file fields     | `multipart/form-data`      | `fileFieldNames: ["avatar"]`    | `{ type: "multipart", fields: {}, fileFields: ["avatar"] }`        |
| Octet-stream                   | `application/octet-stream` | `rawFilename: "doc.pdf"`        | `{ type: "octet-stream", filename: "doc.pdf" }`                    |
| Octet-stream no file           | `application/octet-stream` | no file                         | `null`                                                             |
| GET with body content          | any                        | `bodyValue: '{"a":1}'`          | `null` (GET cannot have a body)                                    |
| Method without body (GET/HEAD) | any                        | any body input                  | `null`                                                             |

---

## Implementation Plan

| Phase | What                                                                                                     | Files                                                                          |
|-------|----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| 1     | Add `RequestShape` / `RequestBodyShape` types                                                            | `src/features/spec/openapi.ts`                                                 |
| 2     | Implement `buildRequest`                                                                                 | new `src/shared/utils/build-request.ts`                                        |
| 3     | Refactor `executeRequest` to call `buildRequest`; assemble `FormData` from shape + original `fileValues` | `src/shared/utils/http-client.ts`                                              |
| 4     | Add Vitest; write test suite                                                                             | new `src/shared/utils/build-request.test.ts`, `package.json`, `vite.config.ts` |

---

## File map

| File                                     | Change                                                                      |
|------------------------------------------|-----------------------------------------------------------------------------|
| `src/features/spec/openapi.ts`           | Add `RequestShape`, `RequestBodyShape`                                      |
| `src/shared/utils/build-request.ts`      | **New** — pure `buildRequest` function                                      |
| `src/shared/utils/http-client.ts`        | Refactor: delegate to `buildRequest`; keep only `fetch` + FormData assembly |
| `src/shared/utils/build-request.test.ts` | **New** — Vitest suite covering all tables above                            |
| `package.json`                           | Add `vitest` dev dependency; add `"test": "vitest"` script                  |
| `vite.config.ts`                         | Add `test: { environment: "node" }` block                                   |

---

## Resolved

| #  | Decision                                                                                                                                                                                                                                                                                                                   |
|----|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| R1 | **`fileFieldNames: string[]`, not `fileValues`**. Keeping `File` objects out of `buildRequest` ensures the function runs in Node.js without any browser API polyfills or mocking. `executeRequest` extracts the keys and passes them; it retains the `File` references for FormData assembly after `buildRequest` returns. |
| R2 | **Cookie params are returned but not sent**. Browsers block setting the `Cookie` header in `fetch`. `executeRequest` emits a `console.warn` when `shape.cookies` is non-empty. A future UI improvement can surface a visible warning in the playground.                                                                    |
| R3 | **`buildRequest` lives in `src/shared/utils/`**. It depends on `spec/` types and calls `buildUrl` from `example-gen.ts`, but has no React or browser dependencies — `shared/utils/` is the correct home.                                                                                                                   |
| R4 | **Query serialization stays in `example-gen.ts`**. `buildRequest` calls the existing `buildUrl` + `serializeQueryParam` rather than duplicating logic. Auth query extras (apiKey `in: query`) are appended by `buildRequest` after the base URL is built, consistent with how `executeRequest` does it today.              |
| R5 | **`rawFilename` is a separate parameter, not derived from `fileValues`**. The filename comes from the `File` object (`file.name`), which `executeRequest` extracts before calling `buildRequest`. This keeps the builder pure while still making octet-stream bodies testable.                                             |