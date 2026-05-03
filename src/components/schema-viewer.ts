/**
 * Reusable schema visualization component.
 * Renders a tabbed UI with a "Schema" tree and an "Example" JSON panel.
 * Used in endpoint request/response sections and the schema detail page.
 */

import type { Schema, Components } from "../types/openapi";
import { resolveSchema } from "../parser/ref-resolver";
import { schemaToExample } from "../parser/example-gen";
import { highlightJson } from "../utils/highlight";
import {escapeHtml} from "../utils/html";

const TAB_ACTIVE   = "schema-viewer-tab px-3 py-1 text-[11px] font-medium rounded-md bg-white dark:bg-gray-700 shadow-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600";
const TAB_INACTIVE = "schema-viewer-tab px-3 py-1 text-[11px] font-medium rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors";

/** Exported so `app.ts` can restore tab appearance without duplicating the class strings. */
export const SCHEMA_VIEWER_TAB_CLASSES = { active: TAB_ACTIVE, inactive: TAB_INACTIVE };

export interface SchemaViewerOptions {
  /** Pre-serialized JSON example string. Auto-generated from the schema if omitted or null. */
  example?: string | null;
  /** Whether the schema is required at its usage site (shown on the root node when no properties to expand). */
  required?: boolean;
}

/**
 * Renders a schema tree + example JSON as a two-tab widget.
 * Falls back to showing only what's available when one side is empty.
 *
 * @param schema - The OpenAPI schema to visualize.
 * @param components - Spec components used for $ref resolution.
 * @param options - Optional pre-computed example and required flag.
 * @returns HTML string.
 */
export function renderSchemaViewer(
  schema: Schema,
  components: Components | undefined,
  options: SchemaViewerOptions = {}
): string {
  const resolved = resolveSchema(schema, components);
  if (!resolved) return "";

  const combined = resolved.allOf ?? resolved.oneOf ?? resolved.anyOf;
  let schemaHtml = "";
  if (combined?.length) {
    schemaHtml = combined.map((s, i) => renderSchemaNode(`[${i}]`, s, components, 0, false)).join("");
  } else if (resolved.type === "object" && resolved.properties) {
    schemaHtml = Object.entries(resolved.properties)
      .map(([key, prop]) => renderSchemaNode(key, prop, components, 0, resolved.required?.includes(key) ?? false))
      .join("");
  } else if (resolved.type === "array" && resolved.items) {
    schemaHtml = renderSchemaNode("[item]", resolved.items, components, 0, false);
  } else {
    schemaHtml = renderSchemaNode("body", resolved, components, 0, options.required ?? false);
  }

  const exampleJson = options.example !== undefined && options.example !== null
    ? options.example
    : (() => {
        const ex = schemaToExample(schema, components);
        return ex !== null ? JSON.stringify(ex, null, 2) : null;
      })();

  // Degrade gracefully when only one side is available
  if (!schemaHtml && !exampleJson) return "";
  if (!schemaHtml) {
    return `<pre class="text-[11px] bg-gray-50 dark:bg-gray-900 rounded-md p-3 overflow-x-auto text-gray-700 dark:text-gray-300 font-mono leading-relaxed">${highlightJson(exampleJson!)}</pre>`;
  }
  if (!exampleJson) {
    return `<div class="px-3 py-2">${schemaHtml}</div>`;
  }

  return `
    <div class="schema-viewer">
      <div class="flex gap-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
        <button class="${TAB_ACTIVE}"  data-tab="schema">Schema</button>
        <button class="${TAB_INACTIVE}" data-tab="example">Example</button>
      </div>
      <div class="schema-viewer-panel px-3 py-2" data-panel="schema">
        ${schemaHtml}
      </div>
      <div class="schema-viewer-panel hidden px-3 py-2" data-panel="example">
        <pre class="text-[11px] bg-gray-50 dark:bg-gray-900 rounded-md p-3 overflow-x-auto text-gray-700 dark:text-gray-300 font-mono leading-relaxed">${highlightJson(exampleJson)}</pre>
      </div>
    </div>`;
}


export function typeBadgeClass(type: string | undefined): string {
  switch (type) {
    case "string":  return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
    case "integer":
    case "number":  return "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    case "boolean": return "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
    case "object":  return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
    case "array":   return "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400";
    default:        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
  }
}

export function schemaTypeLabel(schema: Schema): string {
  if (schema.type === "array") {
    const itemType = (schema.items as Schema | undefined)?.type ?? "object";
    return `array[${itemType}]`;
  }
  if (schema.allOf) return "allOf";
  if (schema.oneOf) return "oneOf";
  if (schema.anyOf) return "anyOf";
  const base = schema.type ?? "object";
  return schema.format ? `${base}<${schema.format}>` : base;
}

export function renderSchemaNode(
    name: string,
    schema: Schema | undefined,
    components: Components | undefined,
    depth: number,
    required: boolean
): string {
  if (depth > 5) return "";
  const resolved = resolveSchema(schema, components);
  if (!resolved) return "";

  const typeLabel = schemaTypeLabel(resolved);
  const badgeClass = typeBadgeClass(resolved.type);
  const combined = resolved.allOf ?? resolved.oneOf ?? resolved.anyOf;

  const enumHtml = resolved.enum
      ? `<span class="text-[9px] text-gray-400 dark:text-gray-500 font-mono">${resolved.enum.slice(0, 4).map((v) => escapeHtml(String(v))).join(" | ")}</span>`
      : "";

  let childrenHtml = "";
  if (combined?.length) {
    const inner = combined.map((s, i) => renderSchemaNode(`[${i}]`, s, components, depth + 1, false)).join("");
    childrenHtml = `<div class="border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-3 mt-0.5">${inner}</div>`;
  } else if (resolved.type === "object" && resolved.properties) {
    const inner = Object.entries(resolved.properties)
        .map(([key, prop]) => renderSchemaNode(key, prop, components, depth + 1, resolved.required?.includes(key) ?? false))
        .join("");
    childrenHtml = `<div class="border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-3 mt-0.5">${inner}</div>`;
  } else if (resolved.type === "array" && resolved.items) {
    const inner = renderSchemaNode("[item]", resolved.items, components, depth + 1, false);
    childrenHtml = `<div class="border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-3 mt-0.5">${inner}</div>`;
  }

  return `
    <div class="py-0.5">
      <div class="flex items-baseline gap-1.5 flex-wrap">
        <span class="font-mono text-[11px] text-gray-800 dark:text-gray-200">${escapeHtml(name)}</span>
        ${required ? '<span class="text-red-400 text-[9px] font-semibold">*</span>' : ""}
        <span class="text-[10px] rounded px-1.5 py-0.5 font-mono ${badgeClass}">${escapeHtml(typeLabel)}</span>
        ${resolved.nullable ? '<span class="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded px-1 font-mono">nullable</span>' : ""}
        ${resolved.description ? `<span class="text-[11px] text-gray-400 dark:text-gray-500">${escapeHtml(resolved.description)}</span>` : ""}
        ${enumHtml}
      </div>
      ${childrenHtml}
    </div>`;
}