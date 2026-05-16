<!--
  Recursive component that renders a single OpenAPI schema property row
  with its type badge, constraints, description, and nested children.
-->
<script lang="ts">
  import type { Schema, Components } from "../types/openapi";
  import { resolveSchema } from "../parser/ref-resolver";
  import SchemaNode from "./SchemaNode.svelte";

  let { name, schema, components, depth = 0, required = false }: {
    name: string;
    schema: Schema | undefined;
    components: Components | undefined;
    depth?: number;
    required?: boolean;
  } = $props();

  const resolved  = $derived(resolveSchema(schema, components));
  const typeLabel = $derived(resolved ? schemaTypeLabel(resolved) : "");
  const badgeClass = $derived(typeBadgeClass(resolved?.type));
  const combined  = $derived(resolved?.allOf ?? resolved?.oneOf ?? resolved?.anyOf ?? null);
  const constraints = $derived(
    resolved ? [
      resolved.minimum   !== undefined ? `min:${resolved.minimum}`      : "",
      resolved.maximum   !== undefined ? `max:${resolved.maximum}`      : "",
      resolved.minLength !== undefined ? `minLen:${resolved.minLength}` : "",
      resolved.maxLength !== undefined ? `maxLen:${resolved.maxLength}` : "",
    ].filter(Boolean) : []
  );

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

{#if depth <= 5 && resolved}
  <div class="py-0.5">
    <div class="flex items-baseline gap-1.5 flex-wrap">
      <span class="font-mono text-[11px] text-gray-800 dark:text-gray-200">{name}</span>
      {#if required}
        <span class="text-red-400 text-[9px] font-semibold">*</span>
      {/if}
      <span class="text-[10px] rounded px-1.5 py-0.5 font-mono {badgeClass}">{typeLabel}</span>
      {#if resolved.nullable}
        <span class="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded px-1 font-mono">nullable</span>
      {/if}
      {#each constraints as c}
        <span class="text-[9px] font-mono text-gray-400 dark:text-gray-500">{c}</span>
      {/each}
      {#if resolved.description}
        <span class="text-[11px] text-gray-400 dark:text-gray-500">{resolved.description}</span>
      {/if}
      {#if resolved.enum}
        <span class="text-[9px] text-gray-400 dark:text-gray-500 font-mono">
          {resolved.enum.slice(0, 4).map(String).join(" | ")}
        </span>
      {/if}
    </div>

    {#if combined?.length}
      <div class="border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-3 mt-0.5">
        {#each combined as child, i}
          <SchemaNode name="[{i}]" schema={child} {components} depth={depth + 1} />
        {/each}
      </div>
    {:else if resolved.type === "object" && resolved.properties}
      <div class="border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-3 mt-0.5">
        {#each Object.entries(resolved.properties) as [key, prop]}
          <SchemaNode
            name={key}
            schema={prop}
            {components}
            depth={depth + 1}
            required={resolved.required?.includes(key) ?? false}
          />
        {/each}
      </div>
    {:else if resolved.type === "array" && resolved.items}
      <div class="border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-3 mt-0.5">
        <SchemaNode name="[item]" schema={resolved.items} {components} depth={depth + 1} />
      </div>
    {/if}
  </div>
{/if}
