  /** Root application component: layout, dark mode, keyboard shortcuts, hash routing. */
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { AppProviders } from "./shared/contexts";
import { useNav } from "./features/nav/nav-context";
import { useModal, modalActions, modalSnapshot } from "./shared/contexts/modal-context";
import { authActions, authSnapshot } from "./features/auth/auth-context";
import { playgroundSnapshot } from "./features/playground/playground-context";
import { loadSpecFromUrl, restoreFromHash, executePlayground } from "./shared/state/actions";
import { initResizablePanes } from "./shared/utils/resizable-panes";
import Nav from "./features/nav/Nav";
import TopBar from "./shared/components/TopBar";
import DetailPane from "./features/nav/DetailPane";
import Playground from "./features/playground/Playground";
import LoadModal from "./shared/components/LoadModal";
import AuthModal from "./features/auth/AuthModal";
import CommandBar from "./shared/components/CommandBar";

const DARK_KEY = "api-explorer-dark";

const shortcutRows: [string, string][] = [
  ["/",    "Focus search"],
  ["↑ ↓", "Navigate endpoints"],
  ["Enter","Select endpoint"],
  ["Esc",  "Close / dismiss"],
  ["⌘ K", "Open command bar"],
  ["⌘ ↵", "Execute request"],
  ["?",    "Toggle this panel"],
];

/** Inner app: layout, dark mode, shortcuts — rendered inside context providers. */
function AppInner({ initialUrl }: { initialUrl?: string }) {
  const { activeEndpoint } = useNav();
  const { shortcutsVisible } = useModal();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(DARK_KEY);
    return stored !== null
      ? stored === "true"
      : (window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
  });

  const rootRef = useRef<HTMLDivElement>(null);

  function toggleDark() {
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem(DARK_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }

  // Register keyboard shortcuts and hashchange listener once.
  useEffect(() => {
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
        if (playgroundSnapshot.endpoint && !playgroundSnapshot.loading) { e.preventDefault(); executePlayground(); }
        return;
      }
      if (isMeta && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        modalActions.setCommandBarVisible(true);
        return;
      }
      if (e.key === "Escape") {
        if (modalSnapshot.commandBarVisible) { modalActions.setCommandBarVisible(false); return; }
        if (modalSnapshot.shortcutsVisible)  { modalActions.setShortcutsVisible(false); return; }
        if (modalSnapshot.modalVisible)      { modalActions.setModalVisible(false); modalActions.setModalError(""); return; }
        if (authSnapshot.authModalVisible)   { authActions.setAuthModalVisible(false); return; }
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
      if (e.key === "?") { e.preventDefault(); modalActions.setShortcutsVisible(!modalSnapshot.shortcutsVisible); }
    }

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("hashchange", restoreFromHash);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("hashchange", restoreFromHash);
    };
  }, []);

  // Load initial spec URL once.
  useEffect(() => {
    if (initialUrl) loadSpecFromUrl(initialUrl);
  }, [initialUrl]);

  // Initialize resizable panes after first DOM commit.
  useEffect(() => {
    if (rootRef.current) initResizablePanes(rootRef.current);
  }, []);

  const showPlayground = !!activeEndpoint;

  return (
    <div
      ref={rootRef}
      className={clsx("flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900", darkMode && "dark")}
      style={{ fontFamily: "'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif" }}
    >
      <LoadModal />
      <AuthModal />
      <CommandBar onToggleDark={toggleDark} />

      {shortcutsVisible && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => { if (e.target === e.currentTarget) modalActions.setShortcutsVisible(false); }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-72 mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Keyboard shortcuts</span>
              <button
                onClick={() => modalActions.setShortcutsVisible(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none transition-colors"
              >×</button>
            </div>
            <div className="px-5 py-2">
              {shortcutRows.map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <span className="text-xs text-gray-600 dark:text-gray-300">{desc}</span>
                  <kbd className="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 shrink-0">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <TopBar onToggleDark={toggleDark} />

      <div id="pane-container" className="flex flex-1 min-h-0 overflow-hidden">
        <aside id="nav-pane" className="shrink-0 bg-gray-50 dark:bg-gray-800 overflow-y-auto flex flex-col">
          <Nav />
        </aside>

        <div id="handle-left" className="pane-handle" aria-hidden="true">
          <div className="pane-handle-line" />
        </div>

        <main id="detail-pane" className="flex-1 min-w-0 bg-white dark:bg-gray-900 overflow-hidden">
          <DetailPane />
        </main>

        <div id="handle-right" className="pane-handle" aria-hidden="true" style={{ display: showPlayground ? "" : "none" }}>
          <div className="pane-handle-line" />
        </div>

        <aside id="try-pane" className="shrink-0 bg-white dark:bg-gray-900 overflow-hidden" style={{ display: showPlayground ? "" : "none" }}>
          <Playground />
        </aside>
      </div>
    </div>
  );
}

/** Root application component — wraps the full UI in context providers. */
export default function App({ initialUrl }: { initialUrl?: string }) {
  return (
    <AppProviders>
      <AppInner initialUrl={initialUrl} />
    </AppProviders>
  );
}
