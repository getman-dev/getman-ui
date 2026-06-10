  /** Root application component: layout, dark mode, keyboard shortcuts, hash routing. */
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { AppProviders } from "./shared/contexts";
import { useNav } from "./features/nav/nav-context";
import { useModal, modalActions, modalSnapshot } from "./shared/contexts/modal-context";
import { specActions } from "./features/spec/spec-context";
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
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { ThemeModeProvider } from "./shared/contexts/theme-mode-context";
import type { ThemeSlot } from "./themes/slot";
import { slot } from "./themes/slot";
import type { ThemeMode } from "./themes/types";

export interface AppRootTheme {
  root:              ThemeSlot;
  navPane:           ThemeSlot;
  detailPane:        ThemeSlot;
  tryPane:           ThemeSlot;
  shortcutsBackdrop: ThemeSlot;
  shortcutsPanel:    ThemeSlot;
  shortcutsHeader:   ThemeSlot;
  shortcutsTitle:    ThemeSlot;
  shortcutsClose:    ThemeSlot;
  shortcutsRow:      ThemeSlot;
  shortcutsDesc:     ThemeSlot;
  shortcutsKbd:      ThemeSlot;
}

export const appTheme: Record<ThemeMode, AppRootTheme> = {
  default: {
    root:              'flex flex-col h-full overflow-hidden bg-white',
    navPane:           'shrink-0 bg-gray-50 overflow-y-auto flex flex-col',
    detailPane:        'flex-1 min-w-0 bg-white overflow-hidden',
    tryPane:           'shrink-0 bg-white overflow-hidden',
    shortcutsBackdrop: 'fixed inset-0 bg-black/30 flex items-center justify-center z-50',
    shortcutsPanel:    'bg-white rounded-xl shadow-xl w-72 mx-4 overflow-hidden',
    shortcutsHeader:   'flex items-center justify-between px-5 py-3.5 border-b border-gray-100',
    shortcutsTitle:    'text-sm font-semibold text-gray-800',
    shortcutsClose:    'text-gray-400 hover:text-gray-600 text-xl leading-none transition-colors',
    shortcutsRow:      'flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0',
    shortcutsDesc:     'text-xs text-gray-600',
    shortcutsKbd:      'text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200 shrink-0',
  },
  dark: {
    root:              'flex flex-col h-full overflow-hidden bg-gray-900',
    navPane:           'shrink-0 bg-gray-800 overflow-y-auto flex flex-col',
    detailPane:        'flex-1 min-w-0 bg-gray-900 overflow-hidden',
    tryPane:           'shrink-0 bg-gray-900 overflow-hidden',
    shortcutsBackdrop: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50',
    shortcutsPanel:    'bg-gray-800 rounded-xl shadow-xl w-72 mx-4 overflow-hidden',
    shortcutsHeader:   'flex items-center justify-between px-5 py-3.5 border-b border-gray-700',
    shortcutsTitle:    'text-sm font-semibold text-gray-200',
    shortcutsClose:    'text-gray-500 hover:text-gray-300 text-xl leading-none transition-colors',
    shortcutsRow:      'flex items-center justify-between py-1.5 border-b border-gray-700/50 last:border-0',
    shortcutsDesc:     'text-xs text-gray-300',
    shortcutsKbd:      'text-[10px] font-mono bg-gray-700 text-gray-400 px-2 py-0.5 rounded border border-gray-600 shrink-0',
  },
};

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
        if (modalSnapshot.modalVisible)      { modalActions.setModalVisible(false); specActions.setLoadError(""); return; }
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
  const t = appTheme[darkMode ? 'dark' : 'default'];

  return (
    <ThemeModeProvider mode={darkMode ? 'dark' : 'default'}>
    <div
      ref={rootRef}
      className={clsx(slot(t.root), darkMode && "dark")}
      style={{ fontFamily: "'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif" }}
    >
      <LoadModal />
      <AuthModal />
      <CommandBar onToggleDark={toggleDark} />

      {shortcutsVisible && (
        <div
          className={slot(t.shortcutsBackdrop)}
          onClick={(e) => { if (e.target === e.currentTarget) modalActions.setShortcutsVisible(false); }}
        >
          <div className={slot(t.shortcutsPanel)}>
            <div className={slot(t.shortcutsHeader)}>
              <span className={slot(t.shortcutsTitle)}>Keyboard shortcuts</span>
              <button
                onClick={() => modalActions.setShortcutsVisible(false)}
                className={slot(t.shortcutsClose)}
              >×</button>
            </div>
            <div className="px-5 py-2">
              {shortcutRows.map(([key, desc]) => (
                <div key={key} className={slot(t.shortcutsRow)}>
                  <span className={slot(t.shortcutsDesc)}>{desc}</span>
                  <kbd className={slot(t.shortcutsKbd)}>{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <TopBar onToggleDark={toggleDark} />

      <ErrorBoundary>
        <div id="pane-container" className="flex flex-1 min-h-0 overflow-hidden">
          <aside id="nav-pane" className={slot(t.navPane)}>
            <Nav />
          </aside>

          <div id="handle-left" className="pane-handle" aria-hidden="true">
            <div className="pane-handle-line" />
          </div>

          <main id="detail-pane" className={slot(t.detailPane)}>
            <DetailPane />
          </main>

          <div id="handle-right" className="pane-handle" aria-hidden="true" style={{ display: showPlayground ? "" : "none" }}>
            <div className="pane-handle-line" />
          </div>

          <aside id="try-pane" className={slot(t.tryPane)} style={{ display: showPlayground ? "" : "none" }}>
            <Playground />
          </aside>
        </div>
      </ErrorBoundary>
    </div>
    </ThemeModeProvider>
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
