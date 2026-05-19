# Playground: Rich Parameter Input Support

| Field | Value |
|---|---|
| **Status** | Draft |
| **Created** | 2026-05-17 |
| **Area** | `src/components/Playground.tsx` → `src/components/playground/` |
| **Test spec** | `public/specs/parameters-all-types.json` |

---

## Summary

Refactor the Playground's parameter rendering to correctly handle every OpenAPI 3.x parameter type — boolean, array, object, deprecated — while also surfacing schema constraints and default values in the UI. The work includes decomposing the monolithic `Playground.tsx` into focused sub-components under `src/components/playground/`.

---

## Motivation

The current `Playground` renders every parameter as a plain text or number input regardless of schema type. This breaks for:

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
- Serialization style support (`spaceDelimited`, `pipeDelimited`, `deepObject`) — affects URL building, tracked separately
- `allowReserved` URL encoding — URL builder concern, not input UI

---

## Parameter Types to Support

### By location

| Location | Badge color | Notes |
|---|---|---|
| `path` | orange | Always `required: true` |
| `query` | teal | |
| `header` | indigo | |
| `cookie` | purple | **Missing today** — falls through to gray |

### By schema type → input widget

| Schema type | Conditions | Widget |
|---|---|---|
| `string` / `integer` / `number` | no enum | Text or number input |
| `string` / `integer` / `number` | `enum` present | `<select>` |
| `boolean` | — | `<select>` with `—` / `true` / `false` |
| `array` | `items.enum` present | Multi-select checkboxes |
| `array` | free values | Comma-separated text input with hint |
| `object` | any | JSON textarea |

> **Why select for boolean?** A boolean param that is absent is semantically different from one set to `false`. A toggle or checkbox cannot represent the "not provided" state.

> **Why comma-separated for free arrays?** Tag/chip inputs require significant implementation effort. Comma-separated is what most developers expect and type naturally; a label badge ("comma-separated") makes it explicit.

### Schema constraints → tooltip

Constraints are shown inside the help tooltip (alongside `description`). Where applicable, HTML attributes enforce them natively on the input.

| Constraint | Tooltip label | HTML attribute |
|---|---|---|
| `minimum` | `min: N` | `min={N}` on number input |
| `maximum` | `max: N` | `max={N}` on number input |
| `minLength` | `min length: N` | `minLength={N}` |
| `maxLength` | `max length: N` | `maxLength={N}` |
| `pattern` | `pattern: …` | `pattern={…}` |
| `default` | `default: …` | pre-fills input on load |
| `format` | already shown as type badge | — |

### Deprecated params

- Name rendered with `line-through` styling
- Amber `deprecated` badge added to the badge row in `ParamLabel`

---

## Design Decisions

### 1. `ParamField` architecture

**Decision: thin router + typed sub-inputs**

`ParamField` renders `ParamLabel` and delegates to a typed input component based on schema:

```
ParamField
  ├── ParamLabel          (location + type + required + deprecated + help tooltip)
  └── <input widget>
        ├── ScalarInput   (string, integer, number — no enum)
        ├── EnumSelect    (any type with enum, single-value)
        ├── BooleanSelect (boolean — —/true/false)
        ├── ArrayInput    (array with free items — comma-separated)
        ├── MultiSelect   (array with enum items — checkboxes)
        └── ObjectInput   (object — JSON textarea)
```

### 2. State shape for array values

**Decision: keep `paramValues` as `Record<string, string>`**

Arrays are stored as comma-separated strings (e.g. `"1,2,3"`). The URL builder already splits on `,` for multi-value params. This avoids touching the playground context type and keeps the change contained to the UI layer.

Revisit if `pipeDelimited` / `spaceDelimited` serialization is added later.

### 3. Default pre-fill

**Decision: pre-fill in the parent (`Playground.tsx`)**

A single `useEffect` in `Playground` walks all resolved params and writes `schema.default` into `paramValues` when the endpoint changes and the param has no existing value. Mirrors the existing body pre-fill pattern. Prevents a flash of empty inputs and keeps `ParamField` stateless.

### 4. Constraints display

**Decision: tooltip + HTML attributes**

Schema constraints are appended to the help tooltip content below the description. For number/text inputs, the equivalent HTML attributes (`min`, `max`, `minLength`, `maxLength`, `pattern`) are also set so browsers enforce them natively without extra code.

---

## Proposed File Structure

```
src/components/
  Playground.tsx                   ← layout shell + default pre-fill effect
  playground/
    shared.ts                      ← inputClass, fileInputClass constants
    ParamLabel.tsx                 ← name + location/type/required/deprecated badges + tooltip
    ParamField.tsx                 ← resolves schema type → delegates to typed input
    inputs/
      ScalarInput.tsx              ← text / number input
      EnumSelect.tsx               ← <select> for enum params
      BooleanSelect.tsx            ← <select> —/true/false
      ArrayInput.tsx               ← comma-separated text + hint badge
      MultiSelect.tsx              ← checkbox list for array + enum items
      ObjectInput.tsx              ← JSON textarea
    MultipartField.tsx             ← multipart form field (form location)
    SendBar.tsx                    ← method badge + URL preview + Send button
    AuthStatus.tsx                 ← security scheme status rows
    BodyEditor.tsx                 ← JSON/binary/text body editor
    ResponsePanel.tsx              ← response tabs, copy, status badge
```

---

## Open Questions

| # | Question | Options | Impact |
|---|---|---|---|
| 1 | Should `MultiSelect` (array+enum) use a dropdown or inline checkboxes? | Dropdown (compact) vs inline list (always visible) | Layout |
| 2 | Should constraints also be shown as text below the input (always visible)? | Tooltip only vs below-input text | Layout |
| 3 | How should we handle `object` params beyond a JSON textarea? (deepObject style has known key structure) | JSON textarea vs structured key-value rows | Implementation effort |
| 4 | Should `cookie` params show a warning that browsers block JS from reading HttpOnly cookies? | Yes (info badge/tooltip) vs no | UX |

---

## Implementation Plan

| Phase | Scope | Files touched |
|---|---|---|
| 1 | Component scaffold — create `playground/` folder, move shared constants, extract `ResponsePanel`, `SendBar`, `AuthStatus`, `BodyEditor` | `Playground.tsx` + 5 new files |
| 2 | `ParamLabel` enhancements — `cookie` badge, `deprecated` styling, constraints in tooltip | `playground/ParamLabel.tsx` |
| 3 | Typed inputs — `ScalarInput`, `EnumSelect`, `BooleanSelect`, `ArrayInput`, `MultiSelect`, `ObjectInput` | 6 new files under `playground/inputs/` |
| 4 | `ParamField` router — wires schema type → correct input component | `playground/ParamField.tsx` |
| 5 | Default pre-fill — `useEffect` in `Playground.tsx` for `schema.default` | `Playground.tsx` |