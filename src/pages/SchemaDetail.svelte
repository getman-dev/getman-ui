<!-- Schema detail view: type header and full schema tree with example tab. -->
<script lang="ts">
  import type { Schema } from "../types/openapi";
  import { navState } from "../state/nav-state.svelte.ts";
  import { specState } from "../state/spec-state.svelte.ts";
  import { resolveSchema } from "../parser/ref-resolver";
  import SchemaViewer from "../components/SchemaViewer.svelte";

  const name      = $derived(navState.activeSchema);
  const rawSchema = $derived(name ? (specState.spec?.components?.schemas?.[name] ?? null) : null);
  const components = $derived(specState.spec?.components);
  const resolved  = $derived(rawSchema ? resolveSchema(rawSchema, components) : null);
  const typeLabel = $derived(resolved ? schemaTypeLabel(resolved) : "");
  const badgeClass = $derived(typeBadgeClass(resolved?.type));

  function typeBadgeClass(type: string | undefined): string {
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

  function schemaTypeLabel(s: Schema): string {
    if (s.type === "array") {
      const itemType = (s.items as Schema | undefined)?.type ?? "object";
      return `array[${itemType}]`;
    }
    if (s.allOf) return "allOf";
    if (s.oneOf) return "oneOf";
    if (s.anyOf) return "anyOf";
    const base = s.type ?? "object";
    return s.format ? `${base}<${s.format}>` : base;
  }
</script>

{#if name && rawSchema && resolved}
  <div class="h-full flex flex-col">

    <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
      <span class="text-[9px] font-bold font-mono px-[5px] py-[2px] rounded {badgeClass} uppercase">{typeLabel}</span>
      <code class="font-mono text-sm text-gray-800 dark:text-gray-200">{name}</code>
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      {#if resolved.description}
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{resolved.description}</p>
      {/if}
      <div class="mb-8">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Schema</h3>
        <div class="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800/50">
          <SchemaViewer schema={rawSchema} {components} />
        </div>
      </div>
    </div>

  </div>
{/if}
