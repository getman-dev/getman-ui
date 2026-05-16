<!--
  Server configuration: a chip button showing the resolved URL, and a modal overlay
  for selecting a server and configuring URL template variables.
  Used in both the top bar and the playground via the `source` prop.
-->
<script lang="ts">
  import { serverState, initServerVariables } from "../state/server-state.svelte.ts";
  import { specState } from "../state/spec-state.svelte.ts";
  import { resolveServerUrl } from "../parser/example-gen";

  let { source }: { source: "topbar" | "playground" } = $props();

  const servers      = $derived(specState.spec?.servers ?? []);
  const activeServer = $derived(servers.find(s => s.url === serverState.selectedServer) ?? servers[0]);
  const varEntries   = $derived(Object.entries(activeServer?.variables ?? {}));
  const resolvedUrl  = $derived(activeServer ? resolveServerUrl(activeServer, serverState.serverVariables) : serverState.selectedServer);
  const isOpen       = $derived(serverState.serverPopoverSource === source);

  function openPanel() {
    serverState.serverPopoverSource = isOpen ? null : source;
  }

  function closePanel() {
    serverState.serverPopoverSource = null;
  }

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) closePanel();
  }

  function onServerChange(e: Event) {
    const url = (e.target as HTMLSelectElement).value;
    const server = servers.find(s => s.url === url);
    serverState.selectedServer = url;
    serverState.serverVariables = initServerVariables(server);
  }

  function onVarChange(varName: string, value: string) {
    serverState.serverVariables = { ...serverState.serverVariables, [varName]: value };
  }

  const chipBase = "flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-colors shrink-0";
  const chipOpen = "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700";
  const chipClosed = "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500";

  const inputBase =
    "text-[11px] font-mono border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 " +
    "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full";
</script>

<!-- Chip button -->
<button class="{chipBase} {isOpen ? chipOpen : chipClosed}" onclick={openPanel}>
  <svg class="w-3 h-3 shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
  </svg>
  <span class="truncate max-w-[240px]">{resolvedUrl}</span>
  <svg class="w-3 h-3 opacity-50 transition-transform shrink-0 {isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
  </svg>
</button>

<!-- Panel modal -->
{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-[60]"
    style="min-height:100vh"
    onclick={onBackdropClick}
  >
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">

      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
          </svg>
          <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Server</h2>
        </div>
        <button onclick={closePanel} class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">×</button>
      </div>

      {#if servers.length > 1}
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <label class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Server</label>
          <select
            class="w-full text-[11px] font-mono border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            value={serverState.selectedServer}
            onchange={onServerChange}
          >
            {#each servers as s}
              <option value={s.url}>{s.description ?? s.url}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if varEntries.length > 0}
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <label class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Variables</label>
          <div class="flex flex-col gap-3">
            {#each varEntries as [varName, varDef]}
              <div class="flex items-start gap-3">
                <div class="w-24 shrink-0 pt-1.5">
                  <p class="text-[11px] font-mono font-medium text-gray-700 dark:text-gray-300">{varName}</p>
                  {#if varDef.description}
                    <p class="text-[10px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{varDef.description}</p>
                  {/if}
                </div>
                {#if varDef.enum?.length}
                  <select
                    class="{inputBase} cursor-pointer"
                    value={serverState.serverVariables[varName] ?? varDef.default}
                    onchange={(e) => onVarChange(varName, (e.target as HTMLSelectElement).value)}
                  >
                    {#each varDef.enum as opt}
                      <option value={opt}>{opt}</option>
                    {/each}
                  </select>
                {:else}
                  <input
                    type="text"
                    class={inputBase}
                    value={serverState.serverVariables[varName] ?? varDef.default}
                    onchange={(e) => onVarChange(varName, (e.target as HTMLInputElement).value)}
                  />
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="px-5 py-4 bg-gray-50 dark:bg-gray-700/50">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Resolved URL</p>
        <code class="text-[11px] font-mono text-gray-700 dark:text-gray-300 break-all">{resolvedUrl}</code>
      </div>

    </div>
  </div>
{/if}
