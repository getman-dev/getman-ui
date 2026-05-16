<!-- Routes between EndpointDetail, SchemaDetail, and the empty state. -->
<script lang="ts">
  import { navState } from "../state/nav-state.svelte.ts";
  import { specState } from "../state/spec-state.svelte.ts";
  import EndpointDetail from "./EndpointDetail.svelte";
  import SchemaDetail from "./SchemaDetail.svelte";
</script>

{#if navState.activeSchema && specState.spec?.components?.schemas?.[navState.activeSchema]}
  <SchemaDetail />
{:else if navState.activeEndpoint}
  <EndpointDetail />
{:else}
  <div class="h-full flex flex-col items-center justify-center text-center px-8 gap-3">
    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    </div>
    <p class="text-sm text-gray-400 dark:text-gray-500">Select an endpoint to view documentation</p>
  </div>
{/if}
