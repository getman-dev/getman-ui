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
import { ThemeProvider, useTheme } from "./themes/context";
import { lightTheme } from "./themes/presets/light";
import { darkTheme } from "./themes/presets/dark";
import { slot } from "./themes/slot";

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

/** Inner app: layout, dark mode, shortcuts — rendered inside context providers and ThemeProvider. */
function AppLayout({ onToggleDark }: { onToggleDark: () => void }) {
  const { activeEndpoint } = useNav();
  const { shortcutsVisible } = useModal();
  const t = useTheme().appRoot;
  const rootRef = useRef<HTMLDivElement>(null);

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

  // Initialize resizable panes after first DOM commit.
  useEffect(() => {
    if (rootRef.current) initResizablePanes(rootRef.current);
  }, []);

  const showPlayground = !!activeEndpoint;

  return (
    <div
      ref={rootRef}
      className={slot(t.root)}
      style={{ fontFamily: "'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif" }}
    >
      <LoadModal />
      <AuthModal />
      <CommandBar onToggleDark={onToggleDark} />

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

      <TopBar onToggleDark={onToggleDark} />

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
  );
}

/** Inner app: selects the theme preset based on dark mode state, then renders AppLayout inside ThemeProvider. */
function AppInner({ initialUrl }: { initialUrl?: string }) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(DARK_KEY);
    return stored !== null
      ? stored === "true"
      : (window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
  });

  // Load initial spec URL once.
  useEffect(() => {
    if (initialUrl) loadSpecFromUrl(initialUrl);
  }, [initialUrl]);

  function toggleDark() {
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem(DARK_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }

  const activeTheme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={activeTheme}>
      <div className={clsx(darkMode && "dark")} style={{ display: "contents" }}>
        <AppLayout onToggleDark={toggleDark} />
      </div>
    </ThemeProvider>
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