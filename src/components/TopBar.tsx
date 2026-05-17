/** Top application bar: API identity, server chip, auth, dark mode, shortcuts, and spec loader. */
import { useSpec } from "../contexts/spec-context";
import { useAuth } from "../contexts/auth-context";
import { authActions } from "../contexts/auth-context";
import { modalActions } from "../contexts/modal-context";
import ServerConfig from "./ServerConfig";

interface Props {
  onToggleDark: () => void;
}

const btnBase = "flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0";
const btnNeutral = `${btnBase} text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500`;

/** Renders the top bar with API identity, server selector, auth, dark mode, and load spec button. */
export default function TopBar({ onToggleDark }: Props) {
  const { spec } = useSpec();
  const { authValues } = useAuth();

  const info    = spec?.info;
  const servers = spec?.servers ?? [];
  const hasAuth = !!spec?.components?.securitySchemes;
  const isAuthorized = hasAuth && Object.values(authValues).some(v => v.value || v.username);
  const monogram = info?.title.trim().charAt(0).toUpperCase() ?? "";

  return (
    <header className="relative flex items-center gap-4 px-6 h-16 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0 z-10">

      {info ? (
        <>
          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-[11px] font-bold text-white leading-none">{monogram}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[180px]">{info.title}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 rounded-full px-1.5 py-px font-mono shrink-0 leading-tight">{info.version}</span>
              </div>
              {info.description && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[220px] leading-tight mt-px" title={info.description}>
                  {info.description}
                </p>
              )}
            </div>
          </div>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 shrink-0 mx-1" />

          {servers.length > 0 && <ServerConfig source="topbar" />}
        </>
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">API Explorer</span>
        </div>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2 shrink-0">

        {hasAuth && (
          <button
            title={isAuthorized ? "Manage authorization" : "Set up authorization"}
            onClick={() => authActions.setAuthModalVisible(true)}
            className={`${btnBase} ${isAuthorized
              ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
              : "text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            {isAuthorized ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                </svg>
                <span>Authorized</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span>Authorize</span>
              </>
            )}
          </button>
        )}

        <button title="Toggle dark mode" onClick={onToggleDark} className={btnNeutral}>
          <svg className="w-3 h-3 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          <span className="dark:hidden">Dark</span>
          <svg className="w-3 h-3 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <span className="hidden dark:block">Light</span>
        </button>

        <button title="Keyboard shortcuts" onClick={() => modalActions.setShortcutsVisible(true)} className={btnNeutral}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 4h18M7 15h.01M12 15h.01M17 15h.01M7 11h.01M12 11h.01M17 11h.01"/>
          </svg>
          Shortcuts
        </button>

        <button
          onClick={() => modalActions.setModalVisible(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md px-3 py-1.5 font-medium transition-colors shrink-0 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          Load spec
          <kbd className="ml-0.5 text-[9px] opacity-60 font-mono">⌘K</kbd>
        </button>

      </div>
    </header>
  );
}
