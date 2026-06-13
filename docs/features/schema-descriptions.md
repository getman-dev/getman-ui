# Feature Spec: Schema Property Descriptions

## Problem

Property descriptions in `SchemaNode` are rendered as a tiny inline `text-[11px]` gray span in the same flex row as the
name, type badge, and constraints. They are visually indistinguishable from constraint labels and easy to miss.
Top-level schema descriptions (on the schema object itself) are not shown at all. Enum value descriptions (
`x-enumDescriptions`) are unsupported.

## Goals

1. Render each property's `description` on its own dedicated line below the metadata row.
2. Show the top-level schema `description` above the property tree in `SchemaViewer`.
3. Support `x-enumDescriptions` to show a description per enum value.

## Non-goals

- Markdown parsing/rendering — plain text only.
- Truncation or "show more" toggle — always fully visible.
- Parameter-level descriptions in the Playground panel (separate concern).

---

## Changes

### 1. `src/features/spec/openapi.ts` — extend `Schema`

Add the `x-enumDescriptions` extension field:

```ts
export interface Schema {
  // ...existing fields...
  "x-enumDescriptions"?: Record<string, string>;
}
```

This is the de-facto standard used by Stoplight, Redocly, and many generator tools to attach human-readable labels to
each enum value.

---

### 2. `src/features/schema/SchemaNode.tsx`

**Remove** the inline description span from the flex row (currently lines 64–66):

```tsx
// REMOVE this from the flex row:
{resolved.description && (
  <span className="text-[11px] text-gray-400 dark:text-gray-500">{resolved.description}</span>
)}
```

**Add** a dedicated description line immediately after the flex row:

```tsx
{resolved.description && (
  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
    {resolved.description}
  </p>
)}
```

**Add** per-enum-value descriptions when `x-enumDescriptions` is present. Place this after the description line, before
the children block:

```tsx
{resolved.enum && resolved["x-enumDescriptions"] && (
  <ul className="mt-1 space-y-0.5">
    {resolved.enum.map((val) => {
      const label = resolved["x-enumDescriptions"]![String(val)];
      return label ? (
        <li key={String(val)} className="flex gap-1.5 text-[10px]">
          <span className="font-mono text-gray-700 dark:text-gray-300">{String(val)}</span>
          <span className="text-gray-400 dark:text-gray-500">— {label}</span>
        </li>
      ) : null;
    })}
  </ul>
)}
```

---

### 3. `src/features/schema/SchemaViewer.tsx`

In the `renderSchemaTree` function (and before returning the tree in the tabbed/no-example layout), render the top-level
schema description when present:

```tsx
function renderTopLevelDescription() {
  if (!resolved?.description) return null;
  return (
    <p className="px-4 pt-3 pb-0 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
      {resolved.description}
    </p>
  );
}
```

Prepend `renderTopLevelDescription()` to each layout branch that currently renders the schema tree:

- The schema-only branch (`resolved && !exampleJson`): render description above the `<div className="px-4 py-3">`.
- The tabbed `"schema"` tab: render description above the schema tree `<div>`.

The example-only branch (no `resolved`) does not show a tree, so no change needed there.

---

## Visual sketch

**Before** (current, inline):

```
userId  string<uuid>  *  The unique identifier assigned at account creation.
```

**After** (own line):

```
userId  string<uuid>  *
  The unique identifier assigned at account creation.
```

**With x-enumDescriptions**:

```
status  string  *
  Current lifecycle state of the account.
  active   — The account is active and can be used.
  suspended — Temporarily restricted; no new activity allowed.
  deleted  — Permanently removed; data retained for 30 days.
```

---

## Acceptance criteria

- [ ] Each property description renders on a new line below the name/type/constraints row.
- [ ] A description that was previously not shown (top-level schema) now appears above the property tree.
- [ ] When `x-enumDescriptions` is present, each enum value appears with its description below the description line.
- [ ] When `x-enumDescriptions` is absent, enum values continue to render exactly as before (inline badge list).
- [ ] Dark mode: description text uses `dark:text-gray-400`, enum labels use `dark:text-gray-300`.
- [ ] No TypeScript errors (`npm run typecheck` passes).
- [ ] No description is shown when the field is absent or empty string.