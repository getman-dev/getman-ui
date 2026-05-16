  <!-- Load-spec modal: URL input, file upload, and Petstore shortcut. -->
<script lang="ts">
  import { modalState } from "../state/modal-state.svelte.ts";

  let { onLoadUrl, onLoadFile }: {
    onLoadUrl: (url: string) => Promise<void>;
    onLoadFile: (file: File) => Promise<void>;
  } = $props();

  let urlValue = $state("");

  function close() {
    modalState.modalVisible = false;
    modalState.modalError = "";
  }

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  async function loadUrl() {
    const url = urlValue.trim();
    if (!url) return;
    modalState.modalUrlValue = url;
    await onLoadUrl(url);
  }

  async function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    await onLoadFile(file);
  }

  async function loadPetstore() {
    await onLoadUrl("https://petstore3.swagger.io/api/v3/openapi.json");
  }
</script>

{#if modalState.modalVisible}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50"
    style="min-height:100vh"
    onclick={onBackdropClick}
  >
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">

      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Load OpenAPI specification</h2>
        <button onclick={close} class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">×</button>
      </div>

      <div class="px-5 py-5 flex flex-col gap-4">

        <!-- URL input -->
        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">From URL</label>
          <div class="flex gap-2">
            <input
              type="url"
              bind:value={urlValue}
              placeholder="https://api.example.com/openapi.json"
              onkeydown={(e) => e.key === "Enter" && loadUrl()}
              class="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors"
            />
            <button
              onclick={loadUrl}
              class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium transition-colors shrink-0"
            >
              Load
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          <span class="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">or</span>
          <div class="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        <!-- File upload -->
        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">From file</label>
          <label class="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg px-4 py-5 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
            <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span class="text-xs text-gray-500 dark:text-gray-400">Drop .json or .yaml file, or click to browse</span>
            <input type="file" accept=".json,.yaml,.yml" class="hidden" onchange={onFileChange} />
          </label>
        </div>

        {#if modalState.modalError}
          <p class="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md px-3 py-2">
            {modalState.modalError}
          </p>
        {/if}

      </div>

      <div class="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <p class="text-[10px] text-gray-400 dark:text-gray-500">Supports OpenAPI 3.0 and 3.1</p>
        <button onclick={loadPetstore} class="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Try Petstore example
        </button>
      </div>

    </div>
  </div>
{/if}
