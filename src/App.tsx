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
import { THEMES } from "./themes";
import { slot } from "./themes/slot";

const THEME_KEY = "api-explorer-theme";

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
function AppLayout({ onSetTheme }: { onSetTheme: (name: string) => void }) {
  const { activeEndpoint } = useNav();
  const { shortcutsVisible } = useModal();
  const theme = useTheme();
  const t = theme.appRoot;
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
      style={{ fontFamily: theme.fontFamily }}
    >
      <LoadModal />
      <AuthModal />
      <CommandBar onSetTheme={onSetTheme} />

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

      <TopBar onSetTheme={onSetTheme} />

      <ErrorBoundary>
        <div id="pane-container" className="flex flex-1 min-h-0 overflow-hidden">
          <aside id="nav-pane" className={slot(t.navPane)}>
            <Nav />
          </aside>

          <div id="handle-left" className={`w-1 shrink-0 cursor-col-resize group ${theme.paneHandle}`} aria-hidden="true" />

          <main id="detail-pane" className={slot(t.detailPane)}>
            <DetailPane />
          </main>

          <div id="handle-right" className={`w-1 shrink-0 cursor-col-resize group ${theme.paneHandle}`} aria-hidden="true" style={{ display: showPlayground ? "" : "none" }} />

          <aside id="try-pane" className={slot(t.tryPane)} style={{ display: showPlayground ? "" : "none" }}>
            <Playground />
          </aside>
        </div>
      </ErrorBoundary>
    </div>
  );
}

/** Inner app: selects the theme preset based on stored theme name, then renders AppLayout inside ThemeProvider. */
function AppInner({ initialUrl }: { initialUrl?: string }) {
  const [themeName, setThemeName] = useState<string>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && THEMES[stored]) return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Load initial spec URL once.
  useEffect(() => {
    if (initialUrl) loadSpecFromUrl(initialUrl);
  }, [initialUrl]);

  function setTheme(name: string) {
    if (!THEMES[name]) return;
    setThemeName(name);
    try { localStorage.setItem(THEME_KEY, name); } catch { /* ignore */ }
  }

  const activeTheme = THEMES[themeName] ?? THEMES.light;

  return (
    <ThemeProvider theme={activeTheme}>
      <div className={clsx(themeName !== "light" && "dark")} style={{ display: "contents" }}>
        <AppLayout onSetTheme={setTheme} />
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