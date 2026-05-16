<!--
  Tabbed schema visualizer: a "Schema" tree panel and an "Example" JSON panel.
  Degrades gracefully when only one side is available (no tabs rendered).
-->
<script lang="ts">
  import type { Schema, Components } from "../types/openapi";
  import { resolveSchema } from "../parser/ref-resolver";
  import { schemaToExample } from "../parser/example-gen";
  import { highlightJson } from "../utils/highlight";
  import SchemaNode from "./SchemaNode.svelte";

  export interface SchemaViewerOptions {
    /** Pre-serialized JSON example string. Auto-generated from the schema if omitted or null. */
    example?: string | null;
    /** Whether the schema is required at its usage site. */
    required?: boolean;
  }

  let { schema, components, options = {} }: {
    schema: Schema;
    components: Components | undefined;
    options?: SchemaViewerOptions;
  } = $props();

  let activeTab = $state<"schema" | "example">("schema");

  const resolved = $derived(resolveSchema(schema, components));
  const combined = $derived(resolved?.allOf ?? resolved?.oneOf ?? resolved?.anyOf ?? null);

  const exampleJson = $derived.by((): string | null => {
    if (options.example !== undefined && options.example !== null) return options.example;
    const ex = schemaToExample(schema, components);
    return ex !== null ? JSON.stringify(ex, null, 2) : null;
  });

  const highlightedExample = $derived(exampleJson ? highlightJson(exampleJson) : null);

  const TAB_ACTIVE   = "px-3 py-1 text-[11px] font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600";
  const TAB_INACTIVE = "px-3 py-1 text-[11px] font-medium rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors";
</script>

{#snippet schemaTree()}
  {#if combined?.length}
    {#each combined as child, i}
      <SchemaNode name="[{i}]" schema={child} {components} />
    {/each}
  {:else if resolved?.type === "object" && resolved.properties}
    {#each Object.entries(resolved.properties) as [key, prop]}
      <SchemaNode
        name={key}
        schema={prop}
        {components}
        required={resolved.required?.includes(key) ?? false}
      />
    {/each}
  {:else if resolved?.type === "array" && resolved.items}
    <SchemaNode name="[item]" schema={resolved.items} {components} />
  {:else if resolved}
    <SchemaNode name="body" schema={resolved} {components} required={options.required} />
  {/if}
{/snippet}

{#if !resolved && exampleJson}
  <!-- No resolvable schema — show example only -->
  <pre class="text-[11px] bg-gray-50 dark:bg-gray-900 rounded-md p-3 overflow-x-auto text-gray-700 dark:text-gray-300 font-mono leading-relaxed">{@html highlightedExample}</pre>
{:else if resolved && !exampleJson}
  <!-- Schema only — no tabs -->
  <div class="px-3 py-2">
    {@render schemaTree()}
  </div>
{:else if resolved && exampleJson}
  <!-- Both sides — tabbed view -->
  <div>
    <div class="flex gap-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
      <button class={activeTab === "schema" ? TAB_ACTIVE : TAB_INACTIVE} onclick={() => activeTab = "schema"}>
        Schema
      </button>
      <button class={activeTab === "example" ? TAB_ACTIVE : TAB_INACTIVE} onclick={() => activeTab = "example"}>
        Example
      </button>
    </div>
    {#if activeTab === "schema"}
      <div class="px-3 py-2">
        {@render schemaTree()}
      </div>
    {:else}
      <div class="px-3 py-2">
        <pre class="text-[11px] bg-gray-50 dark:bg-gray-900 rounded-md p-3 overflow-x-auto text-gray-700 dark:text-gray-300 font-mono leading-relaxed">{@html highlightedExample}</pre>
      </div>
    {/if}
  </div>
{/if}
