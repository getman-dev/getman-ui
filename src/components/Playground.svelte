<!-- Try-it-out panel: params, body, auth status, URL preview, and response viewer. -->
<script lang="ts">
  import type { Schema, Components } from "../types/openapi";
  import { playgroundState } from "../state/playground-state.svelte.ts";
  import { specState } from "../state/spec-state.svelte.ts";
  import { authState } from "../state/auth-state.svelte.ts";
  import { serverState } from "../state/server-state.svelte.ts";
  import { executePlayground } from "../state/actions";
  import { resolveParameter, resolveSchema } from "../parser/ref-resolver";
  import { buildUrl, resolveServerUrl, getRequestBodyExample } from "../parser/example-gen";
  import { methodBadgeClasses } from "../utils/badges";
  import { highlightJson } from "../utils/highlight";
  import ServerConfig from "./ServerConfig.svelte";

  // ── Local UI state ────────────────────────────────────────────────────────────
  let responseTab = $state<"body" | "headers">("body");
  let copied = $state(false);

  // ── Derived from global state ─────────────────────────────────────────────────
  const endpoint   = $derived(playgroundState.endpoint);
  const components = $derived(specState.spec?.components);
  const spec       = $derived(specState.spec);

  const params = $derived(
    (endpoint?.operation.parameters ?? []).map(p => resolveParameter(p, components))
  );
  const pathParams   = $derived(params.filter(p => p.in === "path"));
  const queryParams  = $derived(params.filter(p => p.in === "query"));
  const headerParams = $derived(params.filter(p => p.in === "header"));

  const servers    = $derived(spec?.servers ?? [{ url: "http://localhost" }]);
  const activeServer = $derived(servers.find(s => s.url === serverState.selectedServer) ?? servers[0]);
  const resolvedBase = $derived(
    activeServer ? resolveServerUrl(activeServer, serverState.serverVariables) : (servers[0]?.url ?? "http://localhost")
  );

  const resolvedUrl = $derived(
    endpoint ? buildUrl(resolvedBase, endpoint.path, playgroundState.paramValues, params) : ""
  );

  const canExecute = $derived(
    !!endpoint && pathParams.every(p => !p.required || playgroundState.paramValues[p.name])
  );

  // Pre-fill body textarea with example when endpoint changes and body is still empty.
  $effect(() => {
    const ep = playgroundState.endpoint;
    if (!ep || playgroundState.bodyValue) return;
    const example = getRequestBodyExample(ep, specState.spec?.components);
    if (example) playgroundState.bodyValue = example;
  });

  // Reset response tab when a new response arrives.
  $effect(() => {
    playgroundState.response; // tracked
    responseTab = "body";
  });

  const prettyBody = $derived.by(() => {
    const body = playgroundState.response?.body ?? "";
    try { return JSON.stringify(JSON.parse(body), null, 2); } catch { return body; }
  });

  const highlightedBody = $derived(highlightJson(prettyBody));

  const headersText = $derived(
    Object.entries(playgroundState.response?.headers ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n")
  );

  // ── Auth scheme helpers ───────────────────────────────────────────────────────

  function getApplicableSchemeNames(): string[] | null {
    if (!endpoint || !spec) return null;
    const opSecurity = endpoint.operation.security;
    if (opSecurity !== undefined) {
      if (opSecurity.length === 0) return [];
      return opSecurity.flatMap(req => Object.keys(req));
    }
    if (spec.security !== undefined) {
      if (spec.security.length === 0) return [];
      return spec.security.flatMap(req => Object.keys(req));
    }
    const keys = Object.keys(spec.components?.securitySchemes ?? {});
    return keys.length ? keys : null;
  }

  function schemeShortLabel(type: string, schemeOrIn?: string): string {
    if (type === "apiKey")        return `API Key (${schemeOrIn ?? "header"})`;
    if (type === "http")          return `HTTP ${schemeOrIn ?? "bearer"}`;
    if (type === "oauth2")        return "OAuth 2.0";
    if (type === "openIdConnect") return "OpenID Connect";
    return type;
  }

  // ── Body content type ─────────────────────────────────────────────────────────

  const bodyContentType = $derived.by(() => {
    if (!endpoint) return "application/json";
    const content = endpoint.operation.requestBody?.content ?? {};
    if ("multipart/form-data"      in content) return "multipart/form-data";
    if ("application/octet-stream" in content) return "application/octet-stream";
    if ("application/json"         in content) return "application/json";
    return Object.keys(content)[0] ?? "application/json";
  });

  const multipartSchema = $derived.by(() => {
    if (bodyContentType !== "multipart/form-data" || !endpoint) return null;
    return resolveSchema(
      endpoint.operation.requestBody?.content?.["multipart/form-data"]?.schema,
      components
    );
  });

  // ── Actions ───────────────────────────────────────────────────────────────────

  function setParam(name: string, value: string) {
    playgroundState.paramValues = { ...playgroundState.paramValues, [name]: value };
  }

  function setBodyParam(name: string, value: string) {
    playgroundState.bodyParams = { ...playgroundState.bodyParams, [name]: value };
  }

  function setFile(name: string, files: FileList, multiple: boolean) {
    playgroundState.fileValues = {
      ...playgroundState.fileValues,
      [name]: multiple ? Array.from(files) : files[0],
    };
  }

  function formatJson() {
    try {
      playgroundState.bodyValue = JSON.stringify(JSON.parse(playgroundState.bodyValue), null, 2);
    } catch { /* not valid JSON */ }
  }

  async function copyResponse() {
    await navigator.clipboard.writeText(prettyBody);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  // ── Style constants ───────────────────────────────────────────────────────────

  const inputClass =
    "w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 " +
    "text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono";

  const fileInputClass =
    "block w-full text-xs text-gray-600 dark:text-gray-400 cursor-pointer " +
    "file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 " +
    "file:text-xs file:font-medium file:bg-blue-50 dark:file:bg-blue-900/40 " +
    "file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/60";
</script>

<!-- ── Snippets ──────────────────────────────────────────────────────────────── -->

{#snippet paramField(param: ReturnType<typeof resolveParameter>, value: string)}
  {@const isPath   = param.in === "path"}
  {@const required = isPath || !!param.required}
  {@const hasEnum  = !!param.schema?.enum?.length}
  {@const inputType = (param.schema?.type === "integer" || param.schema?.type === "number") ? "number" : "text"}
  <div>
    <label class="flex items-center gap-1.5 mb-2">
      <span class="font-mono text-[11px] text-gray-800 dark:text-gray-200">{param.name}</span>
      {#if required}<span class="text-red-500 text-[9px] font-semibold">required</span>{/if}
      <span class="text-[9px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded px-1 font-mono">{param.in}</span>
    </label>
    {#if hasEnum}
      <select class={inputClass} value={value} onchange={(e) => setParam(param.name, (e.target as HTMLSelectElement).value)}>
        {#if !required}<option value="">—</option>{/if}
        {#each (param.schema?.enum ?? []) as v}
          <option value={String(v)}>{String(v)}</option>
        {/each}
      </select>
    {:else}
      <input
        type={inputType}
        class={inputClass}
        {value}
        placeholder={param.schema?.example != null ? String(param.schema.example) : param.name}
        oninput={(e) => setParam(param.name, (e.target as HTMLInputElement).value)}
      />
    {/if}
    {#if param.description}
      <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{param.description}</p>
    {/if}
  </div>
{/snippet}

{#snippet multipartField(name: string, prop: Schema, required: boolean)}
  {@const resolved      = resolveSchema(prop, components)}
  {@const isBinary      = resolved?.format === "binary"}
  {@const isMultiBinary = resolved?.type === "array" && resolveSchema(resolved.items, components)?.format === "binary"}
  {@const isObject      = resolved?.type === "object" || (resolved?.properties != null && !isBinary)}
  {@const inputType     = (resolved?.type === "integer" || resolved?.type === "number") ? "number" : "text"}
  <div>
    <label class="flex items-center gap-1.5 mb-2">
      <span class="font-mono text-[11px] text-gray-800 dark:text-gray-200">{name}</span>
      {#if required}<span class="text-red-500 text-[9px] font-semibold">required</span>{/if}
      {#if isBinary || isMultiBinary}
        <span class="text-[9px] text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded px-1">file</span>
      {/if}
    </label>
    {#if isBinary}
      <input type="file" class={fileInputClass} onchange={(e) => { const f = (e.target as HTMLInputElement).files; if (f?.length) setFile(name, f, false); }} />
    {:else if isMultiBinary}
      <input type="file" multiple class={fileInputClass} onchange={(e) => { const f = (e.target as HTMLInputElement).files; if (f?.length) setFile(name, f, true); }} />
    {:else if isObject}
      <textarea rows="3" class={inputClass} placeholder={`{"key": "value"}`}
        value={playgroundState.bodyParams[name] ?? ""}
        oninput={(e) => setBodyParam(name, (e.target as HTMLTextAreaElement).value)}></textarea>
    {:else}
      <input type={inputType} class={inputClass}
        placeholder={resolved?.example != null ? String(resolved.example) : name}
        value={playgroundState.bodyParams[name] ?? ""}
        oninput={(e) => setBodyParam(name, (e.target as HTMLInputElement).value)} />
    {/if}
    {#if resolved?.description}
      <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{resolved.description}</p>
    {/if}
  </div>
{/snippet}

<!-- ── Empty state ─────────────────────────────────────────────────────────────── -->

{#if !endpoint}
  <div class="h-full flex flex-col items-center justify-center text-center px-6 gap-3 bg-white dark:bg-gray-900">
    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    </div>
    <p class="text-sm text-gray-400 dark:text-gray-500">Select an endpoint to use the playground</p>
  </div>

{:else}
  {@const rb            = endpoint.operation.requestBody}
  {@const schemeNames   = getApplicableSchemeNames()}
  {@const allSchemes    = spec?.components?.securitySchemes ?? {}}

  <div class="h-full flex flex-col bg-white dark:bg-gray-900">

    <!-- Header -->
    <div class="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
      <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">Playground</span>
      <div class="flex-1"></div>
      <ServerConfig source="playground" />
    </div>

    <!-- URL bar + Send -->
    <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0 bg-gray-50/50 dark:bg-gray-800/30">
      <div class="flex items-stretch gap-2">
        <div class="flex items-center gap-2 flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-2">
          <span class="font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 {methodBadgeClasses(endpoint.method)}">
            {endpoint.method.toUpperCase()}
          </span>
          <code class="text-[10px] text-gray-600 dark:text-gray-400 leading-tight flex-1 min-w-0 break-all">
            {resolvedUrl}
          </code>
        </div>
        <button
          disabled={!canExecute || playgroundState.loading}
          title={canExecute ? "Send request (⌘ Enter)" : "Fill required path parameters first"}
          onclick={executePlayground}
          class="shrink-0 px-4 rounded-lg text-xs font-semibold transition-all {canExecute && !playgroundState.loading ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}"
        >
          Send
        </button>
      </div>
    </div>

    <!-- Scrollable form -->
    <div class="flex-1 min-h-0 overflow-y-auto px-5 py-6 flex flex-col gap-7">

      <!-- Auth status -->
      {#if schemeNames !== null && Object.keys(allSchemes).length > 0}
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Authorization</p>
          {#if schemeNames.length === 0}
            <p class="text-[10px] text-gray-400 dark:text-gray-500">No authentication required for this endpoint.</p>
          {:else}
            <div class="flex flex-col gap-2">
              {#each schemeNames.filter(n => allSchemes[n]) as n}
                {@const scheme = allSchemes[n]}
                {@const val = authState.authValues[n]}
                {@const authorized = !!(val?.value || val?.username)}
                <div class="flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/30">
                  <div>
                    <span class="text-[11px] font-mono text-gray-700 dark:text-gray-300">{n}</span>
                    <span class="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                      {schemeShortLabel(scheme.type, scheme.in ?? scheme.scheme)}
                    </span>
                  </div>
                  {#if authorized}
                    <span class="text-[9px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide">Authorized</span>
                  {:else}
                    <span class="text-[9px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 uppercase tracking-wide">Not set</span>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Path params -->
      {#if pathParams.length}
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Path</p>
          <div class="flex flex-col gap-4">
            {#each pathParams as p}{@render paramField(p, playgroundState.paramValues[p.name] ?? "")}{/each}
          </div>
        </div>
      {/if}

      <!-- Query params -->
      {#if queryParams.length}
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Query</p>
          <div class="flex flex-col gap-4">
            {#each queryParams as p}{@render paramField(p, playgroundState.paramValues[p.name] ?? "")}{/each}
          </div>
        </div>
      {/if}

      <!-- Header params -->
      {#if headerParams.length}
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Headers</p>
          <div class="flex flex-col gap-4">
            {#each headerParams as p}{@render paramField(p, playgroundState.paramValues[p.name] ?? "")}{/each}
          </div>
        </div>
      {/if}

      <!-- Request body -->
      {#if rb}
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
              Body{#if rb.required} <span class="text-red-500 normal-case font-normal">required</span>{/if}
            </p>
            <span class="text-[9px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5">
              {bodyContentType}
            </span>
          </div>

          {#if bodyContentType === "multipart/form-data"}
            <div class="flex flex-col gap-2.5">
              {#if multipartSchema?.properties}
                {@const requiredSet = new Set(multipartSchema.required ?? [])}
                {#each Object.entries(multipartSchema.properties) as [name, prop]}
                  {@render multipartField(name, prop, requiredSet.has(name))}
                {/each}
              {:else}
                <p class="text-[11px] text-gray-400 dark:text-gray-500">No schema defined.</p>
              {/if}
            </div>

          {:else if bodyContentType === "application/octet-stream"}
            <input type="file" class={fileInputClass}
              onchange={(e) => { const f = (e.target as HTMLInputElement).files; if (f?.length) playgroundState.fileValues = { ...playgroundState.fileValues, __raw__: f[0] }; }} />

          {:else}
            <!-- JSON textarea -->
            <div class="flex items-center justify-between mb-2">
              <span></span>
              <button
                onclick={formatJson}
                class="text-[10px] text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-1.5 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >Format JSON</button>
            </div>
            <textarea
              rows="8"
              bind:value={playgroundState.bodyValue}
              placeholder="Enter JSON body…"
              class="w-full text-[11px] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono resize-y transition-colors leading-relaxed"
            ></textarea>
          {/if}
        </div>
      {/if}

    </div>

    <!-- Response panel — always anchored at bottom -->
    {#if playgroundState.loading}
      <div class="shrink-0 border-t border-gray-100 dark:border-gray-700 h-16 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30">
        <svg class="animate-spin w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        Sending…
      </div>

    {:else if !playgroundState.response}
      <div class="shrink-0 border-t border-gray-100 dark:border-gray-700 h-10 flex items-center justify-center">
        <span class="text-[10px] text-gray-300 dark:text-gray-600">Response will appear here</span>
      </div>

    {:else}
      {@const r = playgroundState.response}
      {@const statusOk = r.status >= 200 && r.status < 300}
      {@const statusColor = r.status === 0
        ? "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
        : statusOk
          ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700"
          : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700"}
      <div class="shrink-0 border-t border-gray-100 dark:border-gray-700 flex flex-col" style="height:280px">

        <!-- Status bar -->
        <div class="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Response</span>
          <span class="text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold {statusColor}">
            {r.status}{r.statusText ? " " + r.statusText : ""}
          </span>
          <span class="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{r.duration}ms</span>
          <div class="flex-1"></div>
          <button
            onclick={copyResponse}
            class="flex items-center gap-1 text-[10px] px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors {copied ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
          >
            {#if copied}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Copied
            {:else}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              Copy
            {/if}
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-0.5 px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 shrink-0">
          <button
            onclick={() => responseTab = "body"}
            class="px-2.5 py-1 text-[10px] rounded font-medium transition-colors {responseTab === 'body' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}"
          >Body</button>
          <button
            onclick={() => responseTab = "headers"}
            class="px-2.5 py-1 text-[10px] rounded font-medium transition-colors {responseTab === 'headers' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}"
          >Headers <span class="ml-0.5 text-gray-300 dark:text-gray-600">{Object.keys(r.headers).length}</span></button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto bg-white dark:bg-gray-900">
          {#if responseTab === "body"}
            <pre class="text-[11px] p-3 text-gray-700 dark:text-gray-300 font-mono leading-relaxed">{@html highlightedBody}</pre>
          {:else}
            <pre class="text-[11px] p-3 text-gray-500 dark:text-gray-400 font-mono leading-relaxed">{headersText}</pre>
          {/if}
        </div>

      </div>
    {/if}

  </div>
{/if}
