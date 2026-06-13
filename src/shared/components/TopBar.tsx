/** Top application bar: API identity, server chip, auth, theme picker, shortcuts, and spec loader. */
import {useSpec} from "../../features/spec/spec-context";
import {authActions, useAuth} from "../../features/auth/auth-context";
import {modalActions} from "../contexts/modal-context";
import ServerConfig from "../../features/server/ServerConfig";
import ThemePicker from "./ThemePicker";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface TopBarTheme {
    container: ThemeSlot;
    specTitle: ThemeSlot;
    specVersion: ThemeSlot;
    specDescription: ThemeSlot;
    noSpecIcon: ThemeSlot;
    noSpecIconSvg: ThemeSlot;
    noSpecTitle: ThemeSlot;
    divider: ThemeSlot;
    authButtonConfigured: ThemeSlot;
    authButtonUnconfigured: ThemeSlot;
    neutralButton: ThemeSlot;
    loadButton: ThemeSlot;
}

interface Props {
    onSetTheme: (name: string) => void;
}

/** Renders the top bar with API identity, server selector, auth, theme picker, and load spec button. */
export default function TopBar({onSetTheme}: Props) {
    const theme = useTheme();
    const t = theme.topBar;
    const {spec} = useSpec();
    const {authValues} = useAuth();

    const info = spec?.info;
    const servers = spec?.servers ?? [];
    const hasAuth = !!spec?.components?.securitySchemes;
    const isAuthorized = hasAuth && Object.values(authValues).some(v => v.value || v.username);
    const monogram = info?.title.trim().charAt(0).toUpperCase() ?? "";

    return (
        <header className={slot(t.container)}>

            {info ? (
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                        className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    </div>
                    <span className={slot(t.noSpecTitle)}>API Explorer</span>
                </div>
            )}

            <div className="flex items-center gap-2 shrink-0">

                {servers.length > 0 && (
                    <>
                        <ServerConfig source="topbar"/>
                        <div className={slot(t.divider)}/>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                                </svg>
                                <span>Authorized</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"/>
                            </>
                        ) : (
                            <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                </svg>
                                <span>Authorize</span>
                            </>
                        )}
                    </button>
                )}

                <ThemePicker onSetTheme={onSetTheme}/>

                <button title="Keyboard shortcuts" onClick={() => modalActions.setShortcutsVisible(true)}
                        className={slot(t.neutralButton)}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 4h18M7 15h.01M12 15h.01M17 15h.01M7 11h.01M12 11h.01M17 11h.01"/>
                    </svg>
                    Shortcuts
                </button>

                <button onClick={() => modalActions.setModalVisible(true)} className={slot(t.loadButton)}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    Load spec
                    <kbd className="ml-0.5 text-[9px] opacity-60 font-mono">⌘K</kbd>
                </button>

            </div>
        </header>
    );
}