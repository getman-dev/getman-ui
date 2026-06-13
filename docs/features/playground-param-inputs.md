# Playground: Rich Parameter Input Support

| Field         | Value                                    |
|---------------|------------------------------------------|
| **Status**    | Draft                                    |
| **Created**   | 2026-05-17                               |
| **Area**      | `src/features/playground/Playground.tsx` |
| **Test spec** | `public/specs/parameters-all-types.json` |

---

## Summary

Refactor the Playground's parameter rendering to correctly handle every OpenAPI 3.x parameter type — boolean, array,
object, deprecated — while also surfacing schema constraints and default values in the UI. The work includes decomposing
the monolithic `Playground.tsx` into focused sub-components under `src/features/playground/`.

---

## Motivation

The current `Playground` renders every parameter as a plain text or number input regardless of schema type. This breaks
for:

- **Boolean** params — text input accepts any string; `true`/`false` must be inferred
- **Array** params — no multi-value UX; the user has no indication that multiple values are expected
- **Object** params — no structured input; user must know to type raw JSON
- **Deprecated** params — no visual warning that the param should not be used
- **Default values** — inputs are always empty on load even when `schema.default` is defined
- **Constraints** (`minimum`, `maximum`, `pattern`, etc.) — silently ignored; the user gets no feedback

The `parameters-all-types.json` spec exercises all of these cases and serves as the acceptance test.

---

## Goals

- Render the correct input widget for every schema type
- Surface `deprecated`, `default`, and schema constraints in the UI
- Add `cookie` location badge (currently missing)
- Decompose `Playground.tsx` (~480 lines) into small, focused components
- Keep `paramValues` state shape changes minimal and backwards-compatible

## Non-goals

- Full client-side validation (error messages, form submission blocking)
- Serialization style support (`spaceDelimited`, `pipeDelimited`, `deepObject`) — affects URL building, tracked
  separately
- `allowReserved` URL encoding — URL builder concern, not input UI

---

## Parameter Types to Support

### By location

| Location | Badge color | Notes                                     |
|----------|-------------|-------------------------------------------|
| `path`   | orange      | Always `required: true`                   |
| `query`  | teal        |                                           |
| `header` | indigo      |                                           |
| `cookie` | purple      | **Missing today** — falls through to gray |

### By schema type → input widget

| Schema type                     | Conditions           | Widget                                 |
|---------------------------------|----------------------|----------------------------------------|
| `string` / `integer` / `number` | no enum              | Text or number input                   |
| `string` / `integer` / `number` | `enum` present       | `<select>`                             |
| `boolean`                       | —                    | `<select>` with `—` / `true` / `false` |
| `array`                         | `items.enum` present | Multi-select checkboxes                |
| `array`                         | free values          | Comma-separated text input with hint   |
| `object`                        | any                  | JSON textarea                          |

> **Why select for boolean?** A boolean param that is absent is semantically different from one set to `false`. A toggle
> or checkbox cannot represent the "not provided" state.

> **Why comma-separated for free arrays?** Tag/chip inputs require significant implementation effort. Comma-separated is
> what most developers expect and type naturally; a label badge ("comma-separated") makes it explicit.

### Schema constraints → badges

Constraints are shown as small badges in the `ParamLabel` row on the right, alongside location/type/required/deprecated.
Always visible — no hover required. Where applicable, the matching HTML attribute is also set on the input so browsers
enforce it natively.

| Constraint  | Badge label                 | HTML attribute                     |
|-------------|-----------------------------|------------------------------------|
| `minimum`   | `min: N`                    | `min={N}` on number input          |
| `maximum`   | `max: N`                    | `max={N}` on number input          |
| `minLength` | `min length: N`             | `minLength={N}` on text input      |
| `maxLength` | `max length: N`             | `maxLength={N}` on text input      |
| `pattern`   | `pattern: …`                | `pattern={…}` on text input        |
| `default`   | `default: …`                | pre-fills input on endpoint change |
| `format`    | already shown as type badge | —                                  |

### Deprecated params

- Name rendered with `line-through` styling
- Amber `deprecated` badge added to the badge row in `ParamLabel`

---

## Design Decisions

### 1. `ParamField` architecture

**Decision: single `ParamField` driven by a normalised `FieldSpec`**

`Playground` normalises both `operation.parameters` and `multipart/form-data` schema properties into a shared
`FieldSpec` before rendering. `ParamField` never knows which source a field came from — it receives a spec and two
optional callbacks.

```ts
interface FieldSpec {
    // Identity
    name: string;
    location: "path" | "query" | "header" | "cookie" | "form";
    required: boolean;
    deprecated?: boolean;
    description?: string;

    // Widget routing
    type?: "string" | "integer" | "number" | "boolean" | "array" | "object";
    format?: string;          // "binary" → FileInput; "date", "date-time" etc. shown in type badge
    enum?: unknown[];         // present → EnumSelect (single-value)
    items?: {                 // array items descriptor
        type?: string;
        format?: string;        // "binary" → file[] in FileInput
        enum?: unknown[];       // present → MultiSelect (checkboxes)
    };

    // Constraints — shown in tooltip; numeric/text inputs also get the matching HTML attribute
    minimum?: number;         // min={} on number input
    maximum?: number;         // max={} on number input
    minLength?: number;       // minLength={} on text input
    maxLength?: number;       // maxLength={} on text input
    pattern?: string;         // pattern={} on text input
    default?: unknown;        // pre-fills the input on endpoint change
    example?: unknown;        // used as placeholder when no value is set
}
```

`Playground` populates `FieldSpec` by reading both the top-level `Parameter` fields (`name`, `in`, `required`,
`deprecated`, `description`) and the resolved schema fields (`type`, `format`, `enum`, `items`, `minimum`, …).
`ParamField` and every input component import only `FieldSpec` — no `Schema` dependency.

`ParamField` renders `ParamLabel` then routes to a typed input based on `FieldSpec`:

```
ParamField
  ├── ParamLabel          (location + type + required + deprecated + tooltip)
  └── <input widget>
        ├── FileInput     (format === "binary" or items.format === "binary")
        ├── BooleanSelect (type === "boolean")
        ├── MultiSelect   (type === "array" + items.enum)
        ├── ArrayInput    (type === "array", free items)
        ├── ObjectInput   (type === "object")
        ├── EnumSelect    (enum at root — any scalar type)
        └── ScalarInput   (everything else)
```

The routing is evaluated top-to-bottom; the first matching condition wins:

| Priority | Condition                                            | Widget          | Note                                                                    |
|----------|------------------------------------------------------|-----------------|-------------------------------------------------------------------------|
| 1        | `format === "binary"` \| `items.format === "binary"` | `FileInput`     | Multipart file upload; `items.format` triggers `multiple`               |
| 2        | `type === "boolean"`                                 | `BooleanSelect` | `<select>` with `—` / `true` / `false` to distinguish absent from false |
| 3        | `type === "array"` + `items.enum`                    | `MultiSelect`   | Checkboxes; user picks many from a fixed set                            |
| 4        | `type === "array"`                                   | `ArrayInput`    | Comma-separated text; hint badge shown                                  |
| 5        | `type === "object"`                                  | `ObjectInput`   | JSON textarea                                                           |
| 6        | `enum` (root)                                        | `EnumSelect`    | Single `<select>`; user picks one from a fixed set                      |
| 7        | _(default)_                                          | `ScalarInput`   | Text or number input depending on `type`                                |

`FileInput` is the only multipart-specific widget. Routing to it is a schema concern (`format`) — `ParamField` does not
check `location`.

State binding is done via callbacks passed by `Playground`:

- `onChange(name, value: string)` — covers all scalar/enum/array/object inputs; writes to `paramValues` for parameters
  and `bodyParams` for form fields
- `onFileChange(name, files: FileList, multiple: boolean)` — provided only for `location === "form"`; writes to
  `fileValues`

### 2. State shape for array values

**Decision: keep `paramValues` as `Record<string, string>`**

Arrays are stored as comma-separated strings (e.g. `"1,2,3"`). The URL builder already splits on `,` for multi-value
params. This avoids touching the playground context type and keeps the change contained to the UI layer.

Revisit if `pipeDelimited` / `spaceDelimited` serialization is added later.

### 3. Default pre-fill

**Decision: pre-fill in the parent (`Playground.tsx`)**

A single `useEffect` in `Playground` walks all resolved params and writes `schema.default` into `paramValues` when the
endpoint changes and the param has no existing value. Mirrors the existing body pre-fill pattern. Prevents a flash of
empty inputs and keeps `ParamField` stateless.

### 4. Constraints display

**Decision: badges in `ParamLabel` + HTML attributes**

Schema constraints are rendered as small badges in the `ParamLabel` row on the right, alongside the existing
location/type/required/deprecated badges. Always visible — no interaction required. For number/text inputs, the
equivalent HTML attributes (`min`, `max`, `minLength`, `maxLength`, `pattern`) are also set so browsers enforce them
natively. The `(?)` tooltip retains only the `description` text.

---

## Proposed File Structure

Files marked `(exists)` are already present. `ParamLabel` is implemented but still inline inside `Playground.tsx` — it
needs to be extracted.

```
src/features/playground/
  playground-context.tsx       ← (exists) params, body, files, response, loading, endpoint
  Playground.tsx               ← (exists) orchestration only — normalises FieldSpec, wires callbacks
  SendBar.tsx                  ← method badge + URL preview + Send button
  AuthStatus.tsx               ← security scheme status rows
  BodyEditor.tsx               ← JSON / binary body editor
  ResponsePanel.tsx            ← response tabs, copy, status badge
  ParamLabel.tsx               ← (extract from Playground.tsx) name + location/type/required/deprecated badges + tooltip
  ParamField.tsx               ← FieldSpec → ParamLabel + typed input router
  inputs/
    ScalarInput.tsx            ← text / number input
    EnumSelect.tsx             ← <select> for enum params
    BooleanSelect.tsx          ← <select> —/true/false
    ArrayInput.tsx             ← comma-separated text + hint badge
    MultiSelect.tsx            ← checkboxes for array + enum items
    ObjectInput.tsx            ← JSON textarea
    FileInput.tsx              ← file / file[] upload (multipart binary fields)
```

---

## Resolved

| #  | Decision                                                                                                                                                                                                                                                                                                                                   |
|----|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| R1 | **`MultipartField` is not a separate component.** `Playground` normalises both `operation.parameters` and multipart schema properties to `FieldSpec` before rendering. `ParamField` handles all field types. File upload behaviour lives in `FileInput` within `inputs/`, routed by schema format — not by a separate top-level component. |
| R2 | **No `shared.ts` for CSS constants.** `inputClass` and `fileInputClass` are inlined into the components that use them.                                                                                                                                                                                                                     |
| R3 | **`MultiSelect` uses a compact dropdown.** Collapsed by default; opens on click. Keeps the params list compact when enum sets are large.                                                                                                                                                                                                   |
| R4 | **Constraints are shown as badges in `ParamLabel`**, on the right side alongside the existing location/type/required/deprecated badges. Always visible, no hover required, no extra vertical space.                                                                                                                                        |
| R5 | **Object params use a JSON textarea.** No key-value row UI — the schema structure is available via the `(?)` tooltip for reference.                                                                                                                                                                                                        |
| R6 | **No cookie warning.** Cookie params are treated like any other location; the HttpOnly restriction is an edge case outside the playground's scope.                                                                                                                                                                                         |

---

## Implementation Plan

| Phase | Scope                                                                                                                                                                                                                    | Files touched                          |
|-------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| 1     | Extract `ParamLabel` — move inline `ParamLabel` out of `Playground.tsx`; inline `inputClass`/`fileInputClass` constants into the components that use them                                                                | `Playground.tsx`, new `ParamLabel.tsx` |
| 2     | `ParamLabel` enhancements — `cookie` badge (currently falls through to gray), `deprecated` strikethrough + badge, constraint badges (`min`, `max`, `pattern`, etc.)                                                      | `ParamLabel.tsx`                       |
| 3     | Panel extraction — extract `ResponsePanel`, `SendBar`, `AuthStatus`, `BodyEditor` from `Playground.tsx`                                                                                                                  | `Playground.tsx` + 4 new files         |
| 4     | Typed inputs — `ScalarInput`, `EnumSelect`, `BooleanSelect`, `ArrayInput`, `MultiSelect`, `ObjectInput`, `FileInput`                                                                                                     | 7 new files under `inputs/`            |
| 5     | `ParamField` + `FieldSpec` — define `FieldSpec`, add normalization in `Playground.tsx` for both `operation.parameters` and multipart properties, replace `renderParamField` / `renderMultipartField` with `<ParamField>` | new `ParamField.tsx`, `Playground.tsx` |
| 6     | Default pre-fill — `useEffect` in `Playground.tsx` writes `schema.default` into `paramValues` when endpoint changes                                                                                                      | `Playground.tsx`                       |