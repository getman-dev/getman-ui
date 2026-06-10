/** Top application bar: API identity, server chip, auth, dark mode, shortcuts, and spec loader. */
import { useSpec } from "../../features/spec/spec-context";
import { useAuth } from "../../features/auth/auth-context";
import { authActions } from "../../features/auth/auth-context";
import { modalActions } from "../contexts/modal-context";
import ServerConfig from "../../features/server/ServerConfig";
import type { ThemeSlot } from "../../themes/slot";
import { slot } from "../../themes/slot";
import type { ThemeMode } from "../../themes/types";
import { useThemeMode } from "../contexts/theme-mode-context";

export interface TopBarTheme {
  container:              ThemeSlot;
  specTitle:              ThemeSlot;
  specVersion:            ThemeSlot;
  specDescription:        ThemeSlot;
  noSpecIcon:             ThemeSlot;
  noSpecIconSvg:          ThemeSlot;
  noSpecTitle:            ThemeSlot;
  divider:                ThemeSlot;
  authButtonConfigured:   ThemeSlot;
  authButtonUnconfigured: ThemeSlot;
  neutralButton:          ThemeSlot;
  loadButton:             ThemeSlot;
}

export const topBarTheme: Record<ThemeMode, TopBarTheme> = {
  default: {
    container:              'relative flex items-center gap-4 px-6 h-16 border-b border-gray-100 bg-white shrink-0 z-10',
    specTitle:              'text-sm font-semibold text-gray-900 truncate',
    specVersion:            'text-[10px] text-gray-400 border border-gray-200 rounded-full px-1.5 py-px font-mono shrink-0 leading-tight',
    specDescription:        'text-[10px] text-gray-400 truncate leading-tight mt-px',
    noSpecIcon:             'w-7 h-7 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0',
    noSpecIconSvg:          'w-4 h-4 text-gray-400',
    noSpecTitle:            'text-sm font-semibold text-gray-400',
    divider:                'w-px h-5 bg-gray-200 mx-1 shrink-0',
    authButtonConfigured:   'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    authButtonUnconfigured: 'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300',
    neutralButton:          'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300',
    loadButton:             'flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md px-3 py-1.5 font-medium transition-colors shrink-0 shadow-sm',
  },
  dark: {
    container:              'relative flex items-center gap-4 px-6 h-16 border-b border-gray-700 bg-gray-900 shrink-0 z-10',
    specTitle:              'text-sm font-semibold text-gray-100 truncate',
    specVersion:            'text-[10px] text-gray-500 border border-gray-600 rounded-full px-1.5 py-px font-mono shrink-0 leading-tight',
    specDescription:        'text-[10px] text-gray-500 truncate leading-tight mt-px',
    noSpecIcon:             'w-7 h-7 rounded-lg bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shrink-0',
    noSpecIconSvg:          'w-4 h-4 text-gray-500',
    noSpecTitle:            'text-sm font-semibold text-gray-500',
    divider:                'w-px h-5 bg-gray-700 mx-1 shrink-0',
    authButtonConfigured:   'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-emerald-400 bg-emerald-900/30 border-emerald-700 hover:bg-emerald-900/50',
    authButtonUnconfigured: 'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-gray-400 bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500',
    neutralButton:          'flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1.5 font-medium border transition-all shrink-0 text-gray-400 bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500',
    loadButton:             'flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md px-3 py-1.5 font-medium transition-colors shrink-0 shadow-sm',
  },
};

interface Props {
  onToggleDark: () => void;
}

/** Renders the top bar with API identity, server selector, auth, dark mode, and load spec button. */
export default function TopBar({ onToggleDark }: Props) {
  const t = topBarTheme[useThemeMode()];
  const isDark = useThemeMode() === 'dark';
  const { spec } = useSpec();
  const { authValues } = useAuth();

  const info    = spec?.info;
  const servers = spec?.servers ?? [];
  const hasAuth = !!spec?.components?.securitySchemes;
  const isAuthorized = hasAuth && Object.values(authValues).some(v => v.value || v.username);
  const monogram = info?.title.trim().charAt(0).toUpperCase() ?? "";

  return (
    <header className={slot(t.container)}>

      {info ? (
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-[11px] font-bold text-white leading-none">{monogram}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={slot(t.specTitle)}>{info.title}</span>
              <span className={slot(t.specVersion)}>{info.version}</span>
            </div>
            {info.description && (
              <p className={slot(t.specDescription)} title={info.description}>
                {info.description}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={slot(t.noSpecIcon)}>
            <svg className={slot(t.noSpecIconSvg)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <span className={slot(t.noSpecTitle)}>API Explorer</span>
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">

        {servers.length > 0 && (
          <>
            <ServerConfig source="topbar" />
            <div className={slot(t.divider)} />
          </>
        )}

        {hasAuth && (
          <button
            title={isAuthorized ? "Manage authorization" : "Set up authorization"}
            onClick={() => authActions.setAuthModalVisible(true)}
            className={isAuthorized ? slot(t.authButtonConfigured) : slot(t.authButtonUnconfigured)}
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

        <button title="Toggle dark mode" onClick={onToggleDark} className={slot(t.neutralButton)}>
          {isDark ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <span>Light</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
              <span>Dark</span>
            </>
          )}
        </button>

        <button title="Keyboard shortcuts" onClick={() => modalActions.setShortcutsVisible(true)} className={slot(t.neutralButton)}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 4h18M7 15h.01M12 15h.01M17 15h.01M7 11h.01M12 11h.01M17 11h.01"/>
          </svg>
          Shortcuts
        </button>

        <button onClick={() => modalActions.setModalVisible(true)} className={slot(t.loadButton)}>
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