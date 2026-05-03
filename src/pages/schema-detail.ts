import type { Schema, Components } from "../types/openapi";
import { resolveSchema } from "../parser/ref-resolver";
import { escapeHtml } from "../utils/html";
import { renderDetailEmpty } from "./endpoint-detail";
import {renderSchemaViewer, schemaTypeLabel, typeBadgeClass} from "../components/schema-viewer";

// ─── Page ─────────────────────────────────────────────────────────────────────

export function renderSchemaDetail(name: string, schema: Schema, components: Components | undefined): string {
  const resolved = resolveSchema(schema, components);
  if (!resolved) return renderDetailEmpty();

  const typeLabel = schemaTypeLabel(resolved);
  const badgeClass = typeBadgeClass(resolved.type ?? "object");
  const viewer = renderSchemaViewer(schema, components);

  return `
    <div class="h-full flex flex-col">
      <div class="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <span class="text-[9px] font-bold font-mono px-[5px] py-[2px] rounded ${badgeClass} uppercase">${escapeHtml(typeLabel)}</span>
        <code class="font-mono text-sm text-gray-800 dark:text-gray-200">${escapeHtml(name)}</code>
      </div>
      <div class="flex-1 overflow-y-auto px-5 py-4">
        ${resolved.description ? `<p class="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">${escapeHtml(resolved.description)}</p>` : ""}
        ${viewer ? `
          <div class="mb-6">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Schema</h3>
            <div class="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800/50">${viewer}</div>
          </div>` : ""}
      </div>
    </div>`;
}