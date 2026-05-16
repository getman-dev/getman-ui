<!-- Root application component: layout, dark mode, keyboard shortcuts, hash routing. -->
<script lang="ts">
  import { navState } from "./state/nav-state.svelte.ts";
  import { modalState } from "./state/modal-state.svelte.ts";
  import { authState } from "./state/auth-state.svelte.ts";
  import { playgroundState } from "./state/playground-state.svelte.ts";
  import { loadSpecFromUrl, loadSpecFromFile, restoreFromHash, executePlayground } from "./state/actions";
  import Nav from "./components/Nav.svelte";
  import TopBar from "./components/TopBar.svelte";
  import DetailPane from "./pages/DetailPane.svelte";
  import Playground from "./components/Playground.svelte";
  import LoadModal from "./components/LoadModal.svelte";
  import AuthModal from "./components/AuthModal.svelte";

  let { initialUrl }: { initialUrl?: string } = $props();

  // ── Dark mode ──────────────────────────────────────────────────────────────
  const DARK_KEY = "api-explorer-dark";
  const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  let darkMode = $state(
    localStorage.getItem(DARK_KEY) !== null
      ? localStorage.getItem(DARK_KEY) === "true"
      : systemDark
  );

  function toggleDark() {
    darkMode = !darkMode;
    try { localStorage.setItem(DARK_KEY, String(darkMode)); } catch { /* ignore */ }
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  function navigateNav(dir: "up" | "down") {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".nav-endpoint"));
    if (!buttons.length) return;
    const focused = document.querySelector<HTMLButtonElement>(".nav-endpoint:focus");
    const idx = focused ? buttons.indexOf(focused) : -1;
    const next = dir === "down"
      ? (idx + 1) % buttons.length
      : (idx - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
    buttons[next]?.scrollIntoView({ block: "nearest" });
  }

  function onKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const inInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
    const isMeta = e.metaKey || e.ctrlKey;

    if (isMeta && e.key === "Enter") {
      if (playgroundState.endpoint && !playgroundState.loading) { e.preventDefault(); executePlayground(); }
      return;
    }
    if (isMeta && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      modalState.modalVisible = true;
      return;
    }
    if (e.key === "Escape") {
      if (modalState.shortcutsVisible) { modalState.shortcutsVisible = false; return; }
      if (modalState.modalVisible)     { modalState.modalVisible = false; modalState.modalError = ""; return; }
      if (authState.authModalVisible)  { authState.authModalVisible = false; return; }
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (inInput && target.id !== "search-input") return;
      e.preventDefault();
      navigateNav(e.key === "ArrowDown" ? "down" : "up");
      return;
    }
    if (inInput) return;
    if (e.key === "/") {
      e.preventDefault();
      const search = document.querySelector<HTMLInputElement>("#search-input");
      search?.focus(); search?.select();
      return;
    }
    if (e.key === "?") { e.preventDefault(); modalState.shortcutsVisible = !modalState.shortcutsVisible; }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  $effect(() => {
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("hashchange", restoreFromHash);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("hashchange", restoreFromHash);
    };
  });

  $effect(() => {
    if (initialUrl) loadSpecFromUrl(initialUrl);
  });

  // ── Layout ────────────────────────────────────────────────────────────────
  const showPlayground = $derived(!!navState.activeEndpoint);

  const shortcutRows: [string, string][] = [
    ["/",    "Focus search"],
    ["↑ ↓", "Navigate endpoints"],
    ["Enter","Select endpoint"],
    ["Esc",  "Close / dismiss"],
    ["⌘ K", "Load spec"],
    ["⌘ ↵", "Execute request"],
    ["?",    "Toggle this panel"],
  ];
</script>

<div
  class="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900"
  class:dark={darkMode}
  style="font-family:'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif"
>

  <!-- Modals -->
  <LoadModal onLoadUrl={loadSpecFromUrl} onLoadFile={loadSpecFromFile} />
  <AuthModal />

  <!-- Keyboard shortcuts overlay -->
  {#if modalState.shortcutsVisible}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50"
      onclick={(e) => { if (e.target === e.currentTarget) modalState.shortcutsVisible = false; }}
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-72 mx-4 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
          <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">Keyboard shortcuts</span>
          <button
            onclick={() => modalState.shortcutsVisible = false}
            class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none transition-colors"
          >×</button>
        </div>
        <div class="px-5 py-2">
          {#each shortcutRows as [key, desc]}
            <div class="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
              <span class="text-xs text-gray-600 dark:text-gray-300">{desc}</span>
              <kbd class="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 shrink-0">{key}</kbd>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Top bar -->
  <TopBar onToggleDark={toggleDark} />

  <!-- Three-pane layout -->
  <div id="pane-container" class="flex flex-1 min-h-0 overflow-hidden">

    <!-- Nav sidebar -->
    <aside id="nav-pane" class="shrink-0 bg-gray-50 dark:bg-gray-800 overflow-y-auto flex flex-col">
      <Nav />
    </aside>

    <div id="handle-left" class="pane-handle" aria-hidden="true">
      <div class="pane-handle-line"></div>
    </div>

    <!-- Detail pane -->
    <main id="detail-pane" class="flex-1 min-w-0 bg-white dark:bg-gray-900 overflow-hidden">
      <DetailPane />
    </main>

    <!-- Right resize handle (hidden when no endpoint selected) -->
    <div id="handle-right" class="pane-handle" aria-hidden="true" style:display={showPlayground ? "" : "none"}>
      <div class="pane-handle-line"></div>
    </div>

    <!-- Playground -->
    <aside id="try-pane" class="shrink-0 bg-white dark:bg-gray-900 overflow-hidden" style:display={showPlayground ? "" : "none"}>
      <Playground />
    </aside>

  </div>
</div>
