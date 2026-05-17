<!-- Sidebar navigation: endpoint list, schema list, search, and tab switching. -->
<script lang="ts">
  import { navState } from "../state/nav-state.svelte.ts";
  import { specState } from "../state/spec-state.svelte.ts";
  import { selectEndpoint, selectSchema } from "../state/actions";
  import { methodBadgeClasses } from "../utils/badges";

  // Which tag groups are collapsed — all expanded by default.
  let collapsedTags = $state(new Set<string>());

  function toggleTag(name: string) {
    const next = new Set(collapsedTags);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    collapsedTags = next;
  }

  const filteredGroups = $derived.by(() => {
    const q = navState.searchQuery.trim().toLowerCase();
    if (!q) return specState.groups;
    return specState.groups
      .map(g => ({
        ...g,
        endpoints: g.endpoints.filter(ep =>
          ep.path.toLowerCase().includes(q) ||
          ep.method.toLowerCase().includes(q) ||
          ep.operation.summary?.toLowerCase().includes(q) ||
          ep.operation.operationId?.toLowerCase().includes(q)
        ),
      }))
      .filter(g => g.endpoints.length > 0);
  });

  const schemas = $derived(specState.spec?.components?.schemas ?? {});

  const filteredSchemaNames = $derived.by(() => {
    const allNames = Object.keys(schemas);
    const q = navState.searchQuery.trim().toLowerCase();
    if (!q) return allNames;
    return allNames.filter(name =>
      name.toLowerCase().includes(q) ||
      schemas[name].description?.toLowerCase().includes(q)
    );
  });

  const searchPlaceholder = $derived(
    navState.sidebarTab === "schemas" ? "Filter schemas…" : "Filter endpoints…"
  );

  const tabClass = (id: "endpoints" | "schemas") =>
    id === navState.sidebarTab
      ? "flex-1 py-3 text-[11px] font-medium transition-colors border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
      : "flex-1 py-3 text-[11px] font-medium transition-colors border-b-2 border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300";
</script>

<aside class="shrink-0 bg-gray-50 dark:bg-gray-800 overflow-y-auto flex flex-col h-full">

  <!-- Tabs -->
  <div class="flex border-b border-gray-100 dark:border-gray-700 shrink-0">
    <button class={tabClass("endpoints")} onclick={() => navState.sidebarTab = "endpoints"}>Endpoints</button>
    <button class={tabClass("schemas")}   onclick={() => navState.sidebarTab = "schemas"}>Schemas</button>
  </div>

  <!-- Search -->
  <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
    <div class="relative">
      <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        id="search-input"
        type="text"
        autocomplete="off"
        placeholder={searchPlaceholder}
        bind:value={navState.searchQuery}
        class="w-full pl-7 pr-6 py-2 text-[11px] border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors"
      />
      {#if navState.searchQuery}
        <button
          onclick={() => navState.searchQuery = ""}
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 leading-none text-sm"
        >×</button>
      {:else}
        <kbd class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-300 dark:text-gray-600 border border-gray-200 dark:border-gray-600 rounded px-1 font-mono pointer-events-none leading-none">/</kbd>
      {/if}
    </div>
  </div>

  <!-- Endpoints tab -->
  {#if navState.sidebarTab === "endpoints"}
    {#if filteredGroups.length === 0}
      <div class="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center gap-2">
        <p class="text-[11px] text-gray-400 dark:text-gray-500">No endpoints match</p>
      </div>
    {:else}
      {#each filteredGroups as group (group.name)}
        {@const collapsed = collapsedTags.has(group.name)}
        <div>
          <button
            class="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-expanded={!collapsed}
            onclick={() => toggleTag(group.name)}
          >
            <span>{group.name}</span>
            <svg
              class="w-3 h-3 transition-transform {collapsed ? '-rotate-90' : ''}"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {#if !collapsed}
            <div>
              {#each group.endpoints as ep}
                {@const isActive = navState.activeEndpoint?.path === ep.path && navState.activeEndpoint?.method === ep.method}
                <button
                  class="nav-endpoint w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors {isActive ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'}"
                  title={ep.operation.summary ?? ep.path}
                  onclick={() => selectEndpoint(ep)}
                >
                  <span class="method-badge shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded {methodBadgeClasses(ep.method)} uppercase w-[36px] text-center">
                    {ep.method}
                  </span>
                  <span class="truncate text-[11px] font-mono">{ep.path}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  {/if}

  <!-- Schemas tab -->
  {#if navState.sidebarTab === "schemas"}
    {#if Object.keys(schemas).length === 0}
      <div class="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center">
        <p class="text-[11px] text-gray-400 dark:text-gray-500">No schemas defined</p>
      </div>
    {:else if filteredSchemaNames.length === 0}
      <div class="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center">
        <p class="text-[11px] text-gray-400 dark:text-gray-500">No schemas match</p>
      </div>
    {:else}
      <div class="overflow-y-auto flex-1">
        {#each filteredSchemaNames as name}
          {@const schema = schemas[name]}
          {@const typeLabel = schema.type ?? (schema.properties ? "object" : schema.items ? "array" : "")}
          {@const isActive = name === navState.activeSchema}
          <button
            class="w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 transition-colors {isActive ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}"
            onclick={() => selectSchema(name)}
          >
            <div class="flex items-center gap-2">
              <span class="shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 uppercase">
                {typeLabel || "obj"}
              </span>
              <span class="truncate text-[11px] font-mono {isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}">
                {name}
              </span>
            </div>
            {#if schema.description}
              <p class="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500 truncate pl-[38px]">{schema.description}</p>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  {/if}

</aside>
