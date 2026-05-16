<!-- Endpoint documentation view: header, parameters table, request body, and responses accordion. -->
<script lang="ts">
  import type { Parameter, Components, Response } from "../types/openapi";
  import { navState } from "../state/nav-state.svelte.ts";
  import { specState } from "../state/spec-state.svelte.ts";
  import { resolveParameter, resolveSchema, resolveResponse } from "../parser/ref-resolver";
  import { methodBadgeClasses } from "../utils/badges";
  import SchemaViewer from "../components/SchemaViewer.svelte";

  // Which response codes are expanded in the accordion.
  let openResponses = $state(new Set<string>());

  function toggleResponse(code: string) {
    const next = new Set(openResponses);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    openResponses = next;
  }

  // Reset accordion when the active endpoint changes.
  $effect(() => {
    navState.activeEndpoint; // tracked dependency
    openResponses = new Set();
  });

  const endpoint  = $derived(navState.activeEndpoint);
  const components = $derived(specState.spec?.components);
  const op        = $derived(endpoint?.operation);
  const params    = $derived((op?.parameters ?? []).map(p => resolveParameter(p, components)));

  const grouped = $derived({
    path:   params.filter(p => p.in === "path"),
    query:  params.filter(p => p.in === "query"),
    header: params.filter(p => p.in === "header"),
    cookie: params.filter(p => p.in === "cookie"),
  });

  // Request body — json content only.
  const jsonContent = $derived(op?.requestBody?.content?.["application/json"]);
  const bodyExample = $derived.by((): string | null => {
    if (!jsonContent) return null;
    if (jsonContent.example !== undefined) return JSON.stringify(jsonContent.example, null, 2);
    if (jsonContent.examples) return JSON.stringify(Object.values(jsonContent.examples)[0]?.value ?? {}, null, 2);
    return null;
  });

  // Resolved responses with media type info.
  const responses = $derived.by(() => {
    if (!op?.responses) return [];
    return Object.entries(op.responses).map(([code, raw]) => {
      const response = resolveResponse(raw as Response, components);
      const content  = response.content ?? {};
      const mediaKey = ["application/json", "*/*"].find(k => k in content) ?? Object.keys(content)[0];
      const mediaType = mediaKey ? content[mediaKey] : undefined;

      let example: string | null = null;
      if (mediaType?.example !== undefined) {
        example = JSON.stringify(mediaType.example, null, 2);
      } else if (mediaType?.examples) {
        const first = Object.values(mediaType.examples)[0];
        if (first?.value !== undefined) example = JSON.stringify(first.value, null, 2);
      }

      return { code, response, mediaKey, mediaType, example };
    });
  });

  function statusClass(code: string): string {
    const n = parseInt(code);
    if (n >= 200 && n < 300) return "text-green-600 dark:text-green-400 font-mono font-semibold";
    if (n >= 400 && n < 500) return "text-amber-600 dark:text-amber-400 font-mono font-semibold";
    if (n >= 500)             return "text-red-600 dark:text-red-400 font-mono font-semibold";
    return "text-blue-600 dark:text-blue-400 font-mono font-semibold";
  }

  const paramLocations = ["path", "query", "header", "cookie"] as const;
</script>

{#if endpoint && op}
  <div class="h-full flex flex-col">

    <!-- Header -->
    <div class="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 shrink-0">
      <span class="method-badge shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded {methodBadgeClasses(endpoint.method)} uppercase w-[36px] text-center">
        {endpoint.method}
      </span>
      <code class="font-mono text-sm text-gray-800 dark:text-gray-200">{endpoint.path}</code>
      {#if op.deprecated}
        <span class="ml-auto text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700 rounded px-2 py-0.5">deprecated</span>
      {/if}
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto px-5 py-4">
      {#if op.summary}
        <p class="text-sm text-gray-700 dark:text-gray-200 mb-1 font-medium">{op.summary}</p>
      {/if}
      {#if op.description}
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">{op.description}</p>
      {:else}
        <div class="mb-4"></div>
      {/if}

      <!-- Parameters -->
      <div class="mb-6">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Parameters</h3>
        {#if params.length === 0}
          <p class="text-xs text-gray-400 italic">No parameters</p>
        {:else}
          {#each paramLocations as loc}
            {#if grouped[loc].length > 0}
              <div class="mb-4">
                <h4 class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">{loc}</h4>
                <div class="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table class="w-full border-collapse">
                    <tbody>
                      {#each grouped[loc] as rawParam}
                        {@const param  = resolveParameter(rawParam as Parameter, components)}
                        {@const schema = resolveSchema(param.schema, components)}
                        <tr class="border-b border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                          <td class="px-3 py-2.5 whitespace-nowrap">
                            <span class="font-mono text-[11px] text-gray-800 dark:text-gray-200">{param.name}</span>
                            {#if param.required}<span class="text-red-500 text-[9px] font-semibold ml-1">*</span>{/if}
                            {#if param.deprecated}<span class="text-gray-400 dark:text-gray-500 text-[9px] ml-1">deprecated</span>{/if}
                          </td>
                          <td class="px-3 py-2.5 whitespace-nowrap">
                            <span class="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded px-1.5 py-0.5 font-mono">{schema?.type ?? "string"}</span>
                          </td>
                          <td class="px-3 py-2.5 whitespace-nowrap">
                            {#if schema?.minimum !== undefined}<span class="text-[10px] font-mono text-gray-400 dark:text-gray-500">min:{schema.minimum}</span>{/if}
                            {#if schema?.maximum !== undefined}<span class="text-[10px] font-mono text-gray-400 dark:text-gray-500 ml-1.5">max:{schema.maximum}</span>{/if}
                          </td>
                          <td class="px-3 py-2.5 w-full text-xs text-gray-500 dark:text-gray-400">
                            {param.description ?? schema?.description ?? ""}
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>
            {/if}
          {/each}
        {/if}
      </div>

      <!-- Request body -->
      {#if op.requestBody && jsonContent?.schema}
        <div class="mb-6">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Request body</h3>
          {#if op.requestBody.description}
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{op.requestBody.description}</p>
          {/if}
          <div class="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
            <div class="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <span class="text-[10px] text-gray-500 dark:text-gray-400 font-mono">application/json</span>
              {#if op.requestBody.required}
                <span class="text-[9px] text-red-500 font-semibold">required</span>
              {/if}
            </div>
            <SchemaViewer
              schema={jsonContent.schema}
              {components}
              options={{ example: bodyExample, required: op.requestBody.required }}
            />
          </div>
        </div>
      {/if}

      <!-- Responses accordion -->
      {#if responses.length > 0}
        <div class="mb-6">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Responses</h3>
          <div class="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
            {#each responses as { code, response, mediaKey, mediaType, example }}
              {@const isOpen = openResponses.has(code)}
              {@const hasContent = !!mediaType?.schema}
              <div>
                <button
                  class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                  onclick={() => hasContent && toggleResponse(code)}
                >
                  <span class="text-xs {statusClass(code)}">{code}</span>
                  <span class="text-xs text-gray-600 dark:text-gray-400 flex-1">{response.description}</span>
                  {#if mediaKey}
                    <span class="text-[10px] font-mono text-gray-400 dark:text-gray-500 shrink-0">{mediaKey}</span>
                  {/if}
                  {#if hasContent}
                    <svg
                      class="w-3 h-3 text-gray-400 dark:text-gray-500 transition-transform shrink-0 {isOpen ? 'rotate-180' : ''}"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  {/if}
                </button>
                {#if hasContent && isOpen}
                  <SchemaViewer schema={mediaType!.schema!} {components} options={{ example }} />
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

    </div>
  </div>
{/if}
