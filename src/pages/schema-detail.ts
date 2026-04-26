import type { Schema, Components } from "../types/openapi";
import { resolveSchema, schemaToExample } from "../parser/spec-parser";
import { escapeHtml } from "../components/nav";
import { highlightJson } from "../utils/highlight";
import { typeBadgeClass, schemaTypeLabel, renderSchemaNode, renderDetailEmpty } from "./endpoint-detail";

// ─── Page ─────────────────────────────────────────────────────────────────────

export function renderSchemaDetail(name: string, schema: Schema, components: Components | undefined): string {
  const resolved = resolveSchema(schema, components);
  if (!resolved) return renderDetailEmpty();

  const typeLabel = schemaTypeLabel(resolved);
  const badgeClass = typeBadgeClass(resolved.type ?? "object");
  const combined = resolved.allOf ?? resolved.oneOf ?? resolved.anyOf;

  let bodyHtml = "";
  if (combined?.length) {
    bodyHtml = combined.map((s, i) => renderSchemaNode(`[${i}]`, s, components, 0, false)).join("");
  } else if (resolved.type === "object" && resolved.properties) {
    bodyHtml = Object.entries(resolved.properties)
      .map(([key, prop]) => renderSchemaNode(key, prop, components, 0, resolved.required?.includes(key) ?? false))
      .join("");
  } else if (resolved.type === "array" && resolved.items) {
    bodyHtml = renderSchemaNode("[item]", resolved.items, components, 0, false);
  }

  const example = schemaToExample(schema, components);
  const exampleJson = example !== undefined ? JSON.stringify(example, null, 2) : null;

  return `
    <div class="h-full flex flex-col">
      <div class="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <span class="text-[9px] font-bold font-mono px-[5px] py-[2px] rounded ${badgeClass} uppercase">${escapeHtml(typeLabel)}</span>
        <code class="font-mono text-sm text-gray-800 dark:text-gray-200">${escapeHtml(name)}</code>
      </div>
      <div class="flex-1 overflow-y-auto px-5 py-4">
        ${resolved.description ? `<p class="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">${escapeHtml(resolved.description)}</p>` : ""}
        ${bodyHtml ? `
          <div class="mb-6">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Properties</h3>
            <div class="border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 px-3 py-2">${bodyHtml}</div>
          </div>` : ""}
        ${exampleJson ? `
          <div class="mb-6">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Example</h3>
            <pre class="text-[11px] bg-gray-50 dark:bg-gray-900 rounded-md p-3 overflow-x-auto text-gray-700 dark:text-gray-300 font-mono leading-relaxed border border-gray-100 dark:border-gray-700">${highlightJson(exampleJson)}</pre>
          </div>` : ""}
      </div>
    </div>`;
}