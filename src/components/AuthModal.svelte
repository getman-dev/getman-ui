<!--
  Authorization modal with a tab per security scheme.
  Handles API key, HTTP basic/bearer, OAuth 2.0, and OpenID Connect.
-->
<script lang="ts">
  import type { SecurityScheme, AuthSchemeValue } from "../types/openapi";
  import { authState } from "../state/auth-state.svelte.ts";
  import { specState } from "../state/spec-state.svelte.ts";

  const schemes = $derived(specState.spec?.components?.securitySchemes ?? {});
  const entries = $derived(Object.entries(schemes));

  let activeScheme = $state("");
  // Local draft values per scheme — only committed to global state on Authorize.
  let drafts = $state<Record<string, AuthSchemeValue>>({});

  // When modal opens or schemes change, reset active tab and drafts.
  $effect(() => {
    if (authState.authModalVisible && entries.length) {
      activeScheme = entries[0][0];
      const initial: Record<string, AuthSchemeValue> = {};
      for (const [name] of entries) {
        initial[name] = { ...(authState.authValues[name] ?? { value: "", username: "", password: "" }) };
      }
      drafts = initial;
    }
  });

  function close() {
    authState.authModalVisible = false;
  }

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function authorize(schemeName: string) {
    authState.authValues = { ...authState.authValues, [schemeName]: { ...drafts[schemeName] } };
  }

  function logout(schemeName: string) {
    const { [schemeName]: _, ...rest } = authState.authValues;
    authState.authValues = rest;
    drafts[schemeName] = { value: "", username: "", password: "" };
  }

  function isAuthorized(name: string) {
    const v = authState.authValues[name];
    return !!(v?.value || v?.username);
  }

  function schemeTypeLabel(scheme: SecurityScheme): string {
    switch (scheme.type) {
      case "apiKey":        return `API Key · ${scheme.in ?? "header"}`;
      case "http":          return `HTTP · ${scheme.scheme ?? "bearer"}`;
      case "oauth2":        return "OAuth 2.0";
      case "openIdConnect": return "OpenID Connect";
      default:              return scheme.type;
    }
  }

  const inputClass =
    "w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 " +
    "text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono";

  const TAB_ACTIVE   = "px-3 py-1.5 text-[11px] font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 flex items-center gap-1.5 shrink-0";
  const TAB_INACTIVE = "px-3 py-1.5 text-[11px] font-medium rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1.5 shrink-0";
</script>

{#if authState.authModalVisible}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50"
    style="min-height:100vh"
    onclick={onBackdropClick}
  >
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Authorization</h2>
        </div>
        <button onclick={close} class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">×</button>
      </div>

      <!-- Scheme tabs (only when multiple schemes) -->
      {#if entries.length > 1}
        <div class="flex gap-1 px-4 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
          {#each entries as [name]}
            <button
              class={activeScheme === name ? TAB_ACTIVE : TAB_INACTIVE}
              onclick={() => activeScheme = name}
            >
              {name}
              {#if isAuthorized(name)}
                <span class="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Scheme panels -->
      <div class="overflow-y-auto flex-1 px-5 py-4">
        {#each entries as [name, scheme]}
          {#if activeScheme === name || entries.length === 1}
            {@const draft = drafts[name] ?? { value: "", username: "", password: "" }}
            {@const authorized = isAuthorized(name)}
            <div>
              <div class="flex items-center gap-2 mb-3 flex-wrap">
                <span class="text-[10px] text-gray-400 dark:text-gray-500">{schemeTypeLabel(scheme)}</span>
                {#if authorized}
                  <span class="text-[9px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide">Authorized</span>
                {/if}
                {#if scheme.description}
                  <span class="text-[10px] text-gray-400 dark:text-gray-500">{scheme.description}</span>
                {/if}
              </div>

              <!-- Form per scheme type -->
              {#if scheme.type === "http" && scheme.scheme?.toLowerCase() === "basic"}
                <div class="flex flex-col gap-2">
                  <div>
                    <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Username</label>
                    <input type="text" class={inputClass} placeholder="username"
                      value={draft.username}
                      oninput={(e) => { drafts[name] = { ...draft, username: (e.target as HTMLInputElement).value }; }} />
                  </div>
                  <div>
                    <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Password</label>
                    <input type="password" class={inputClass} placeholder="password"
                      value={draft.password}
                      oninput={(e) => { drafts[name] = { ...draft, password: (e.target as HTMLInputElement).value }; }} />
                  </div>
                </div>

              {:else if scheme.type === "apiKey"}
                {@const location = scheme.in === "cookie" ? "cookie (read-only in browsers)" : `${scheme.in}: ${scheme.name ?? name}`}
                <div>
                  <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Value <span class="text-gray-400 dark:text-gray-500 font-sans">({location})</span></label>
                  <input type="text" class={inputClass} placeholder="api-key-value"
                    value={draft.value}
                    oninput={(e) => { drafts[name] = { ...draft, value: (e.target as HTMLInputElement).value }; }} />
                </div>

              {:else if scheme.type === "oauth2"}
                {@const flows = scheme.flows ?? {}}
                {@const authUrl  = flows.authorizationCode?.authorizationUrl ?? flows.implicit?.authorizationUrl}
                {@const tokenUrl = flows.authorizationCode?.tokenUrl ?? flows.password?.tokenUrl ?? flows.clientCredentials?.tokenUrl}
                <div class="flex flex-col gap-2">
                  {#if authUrl}
                    <p class="text-[10px] text-gray-400 dark:text-gray-500">Auth URL: <code class="font-mono">{authUrl}</code></p>
                  {/if}
                  {#if tokenUrl}
                    <p class="text-[10px] text-gray-400 dark:text-gray-500">Token URL: <code class="font-mono">{tokenUrl}</code></p>
                  {/if}
                  <div>
                    <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Access Token</label>
                    <input type="text" class={inputClass} placeholder="paste your access token"
                      value={draft.value}
                      oninput={(e) => { drafts[name] = { ...draft, value: (e.target as HTMLInputElement).value }; }} />
                  </div>
                </div>

              {:else if scheme.type === "openIdConnect"}
                <div>
                  {#if scheme.openIdConnectUrl}
                    <p class="text-[10px] text-gray-400 dark:text-gray-500 mb-2">OpenID Connect: <code class="font-mono text-[9px]">{scheme.openIdConnectUrl}</code></p>
                  {/if}
                  <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Access Token</label>
                  <div class="flex items-stretch border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700 focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                    <span class="px-2.5 flex items-center text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-600 border-r border-gray-200 dark:border-gray-600 font-mono shrink-0 select-none">Bearer</span>
                    <input type="text" placeholder="your-token"
                      class="flex-1 text-xs px-2.5 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none font-mono min-w-0"
                      value={draft.value}
                      oninput={(e) => { drafts[name] = { ...draft, value: (e.target as HTMLInputElement).value }; }} />
                  </div>
                </div>

              {:else}
                <!-- http bearer (default) -->
                <div>
                  <label class="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                    Token{#if scheme.bearerFormat} <span class="text-gray-400 dark:text-gray-500 font-sans">({scheme.bearerFormat})</span>{/if}
                  </label>
                  <div class="flex items-stretch border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700 focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                    <span class="px-2.5 flex items-center text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-600 border-r border-gray-200 dark:border-gray-600 font-mono shrink-0 select-none">Bearer</span>
                    <input type="text" placeholder="your-token"
                      class="flex-1 text-xs px-2.5 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none font-mono min-w-0"
                      value={draft.value}
                      oninput={(e) => { drafts[name] = { ...draft, value: (e.target as HTMLInputElement).value }; }} />
                  </div>
                </div>
              {/if}

              <div class="flex gap-2 pt-3">
                <button
                  onclick={() => authorize(name)}
                  class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
                >
                  Authorize
                </button>
                {#if authorized}
                  <button
                    onclick={() => logout(name)}
                    class="text-xs border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 rounded-md font-medium transition-colors"
                  >
                    Logout
                  </button>
                {/if}
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Footer -->
      <div class="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-end shrink-0">
        <button
          onclick={close}
          class="text-xs bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-md font-medium transition-colors"
        >
          Close
        </button>
      </div>

    </div>
  </div>
{/if}
