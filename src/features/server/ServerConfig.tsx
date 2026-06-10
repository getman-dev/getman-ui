/**
 * Server configuration: a chip button showing the resolved URL, and a modal overlay
 * for selecting a server and configuring URL template variables.
 * Used in both the top bar and the playground via the `source` prop.
 */
import clsx from "clsx";
import { useServer, initServerVariables } from "./server-context";
import { useSpec } from "../spec/spec-context";
import { resolveServerUrl } from "../spec/example-gen";
import type { ThemeSlot } from "../../themes/slot";
import { slot } from "../../themes/slot";
import type { ThemeMode } from "../../themes/types";
import { useThemeMode } from "../../shared/contexts/theme-mode-context";

export interface ServerConfigTheme {
  chip:                ThemeSlot; // variants: open
  chipIcon:            ThemeSlot;
  backdrop:            ThemeSlot;
  popover:             ThemeSlot;
  popoverHeader:       ThemeSlot;
  headerIcon:          ThemeSlot;
  headerTitle:         ThemeSlot;
  closeButton:         ThemeSlot;
  sectionDivider:      ThemeSlot;
  sectionLabel:        ThemeSlot;
  serverSelect:        ThemeSlot;
  variableName:        ThemeSlot;
  variableDescription: ThemeSlot;
  variableInput:       ThemeSlot;
  resolvedSection:     ThemeSlot;
  resolvedLabel:       ThemeSlot;
  resolvedValue:       ThemeSlot;
}

export const serverConfigTheme: Record<ThemeMode, ServerConfigTheme> = {
  default: {
    chip: {
      base: 'flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 text-gray-600 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300',
      open: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-200',
    },
    chipIcon:            'w-3 h-3 shrink-0 text-gray-400',
    backdrop:            'fixed inset-0 bg-black/30 flex items-center justify-center z-[60]',
    popover:             'bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden',
    popoverHeader:       'flex items-center justify-between px-5 py-4 border-b border-gray-100',
    headerIcon:          'w-4 h-4 text-gray-500',
    headerTitle:         'text-sm font-semibold text-gray-800',
    closeButton:         'text-gray-400 hover:text-gray-600 text-xl leading-none',
    sectionDivider:      'px-5 py-4 border-b border-gray-100',
    sectionLabel:        'block text-[10px] font-semibold uppercase tracking-wider text-gray-400',
    serverSelect:        'w-full text-[11px] font-mono border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer',
    variableName:        'text-[11px] font-mono font-medium text-gray-700',
    variableDescription: 'text-[10px] text-gray-400 leading-tight mt-0.5',
    variableInput:       'text-[11px] font-mono border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full',
    resolvedSection:     'px-5 py-4 bg-gray-50',
    resolvedLabel:       'text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5',
    resolvedValue:       'text-[11px] font-mono text-gray-700 break-all',
  },
  dark: {
    chip: {
      base: 'flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 text-gray-400 border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-gray-500',
      open: 'bg-blue-900/30 text-blue-400 border-blue-700 hover:bg-blue-900/30 hover:border-blue-700',
    },
    chipIcon:            'w-3 h-3 shrink-0 text-gray-500',
    backdrop:            'fixed inset-0 bg-black/50 flex items-center justify-center z-[60]',
    popover:             'bg-gray-800 rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden',
    popoverHeader:       'flex items-center justify-between px-5 py-4 border-b border-gray-700',
    headerIcon:          'w-4 h-4 text-gray-400',
    headerTitle:         'text-sm font-semibold text-gray-200',
    closeButton:         'text-gray-500 hover:text-gray-300 text-xl leading-none',
    sectionDivider:      'px-5 py-4 border-b border-gray-700',
    sectionLabel:        'block text-[10px] font-semibold uppercase tracking-wider text-gray-500',
    serverSelect:        'w-full text-[11px] font-mono border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer',
    variableName:        'text-[11px] font-mono font-medium text-gray-300',
    variableDescription: 'text-[10px] text-gray-500 leading-tight mt-0.5',
    variableInput:       'text-[11px] font-mono border border-gray-600 rounded-lg px-2.5 py-1.5 bg-gray-700 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full',
    resolvedSection:     'px-5 py-4 bg-gray-700/50',
    resolvedLabel:       'text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5',
    resolvedValue:       'text-[11px] font-mono text-gray-300 break-all',
  },
};

interface Props {
  source: "topbar" | "playground";
}

/** Renders the server chip and, when open, a modal to pick a server and set variables. */
export default function ServerConfig({ source }: Props) {
  const t = serverConfigTheme[useThemeMode()];
  const { spec } = useSpec();
  const { selectedServer, serverVariables, serverPopoverSource, setSelectedServer, setServerVariables, setServerPopoverSource } = useServer();

  const servers      = spec?.servers ?? [];
  const activeServer = servers.find(s => s.url === selectedServer) ?? servers[0];
  const varEntries   = Object.entries(activeServer?.variables ?? {});
  const resolvedUrl  = activeServer ? resolveServerUrl(activeServer, serverVariables) : window.location.origin;
  const isOpen       = serverPopoverSource === source;

  function openPanel() {
    setServerPopoverSource(isOpen ? null : source);
  }

  function closePanel() {
    setServerPopoverSource(null);
  }

  function onBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) closePanel();
  }

  function onServerChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const url = e.target.value;
    const server = servers.find(s => s.url === url);
    setSelectedServer(url);
    setServerVariables(initServerVariables(server));
  }

  function onVarChange(varName: string, value: string) {
    setServerVariables({ ...serverVariables, [varName]: value });
  }

  return (
    <>
      <button className={slot(t.chip, { open: isOpen })} onClick={openPanel}>
        <svg className={slot(t.chipIcon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
        </svg>
        <span className="truncate max-w-[240px]">{resolvedUrl}</span>
        <svg className={clsx("w-3 h-3 opacity-50 transition-transform shrink-0", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {isOpen && (
        <div
          className={slot(t.backdrop)}
          style={{ minHeight: "100vh" }}
          onClick={onBackdropClick}
        >
          <div className={slot(t.popover)}>

            <div className={slot(t.popoverHeader)}>
              <div className="flex items-center gap-2">
                <svg className={slot(t.headerIcon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
                <h2 className={slot(t.headerTitle)}>Server</h2>
              </div>
              <button onClick={closePanel} className={slot(t.closeButton)}>×</button>
            </div>

            {servers.length > 1 && (
              <div className={slot(t.sectionDivider)}>
                <label className={`${slot(t.sectionLabel)} mb-2`}>Server</label>
                <select
                  className={slot(t.serverSelect)}
                  value={selectedServer}
                  onChange={onServerChange}
                >
                  {servers.map(s => (
                    <option key={s.url} value={s.url}>{s.description ?? s.url}</option>
                  ))}
                </select>
              </div>
            )}

            {varEntries.length > 0 && (
              <div className={slot(t.sectionDivider)}>
                <label className={`${slot(t.sectionLabel)} mb-3`}>Variables</label>
                <div className="flex flex-col gap-3">
                  {varEntries.map(([varName, varDef]) => (
                    <div key={varName} className="flex items-start gap-3">
                      <div className="w-24 shrink-0 pt-1.5">
                        <p className={slot(t.variableName)}>{varName}</p>
                        {varDef.description && (
                          <p className={slot(t.variableDescription)}>{varDef.description}</p>
                        )}
                      </div>
                      {varDef.enum?.length ? (
                        <select
                          className={clsx(slot(t.variableInput), 'cursor-pointer')}
                          value={serverVariables[varName] ?? varDef.default}
                          onChange={(e) => onVarChange(varName, e.target.value)}
                        >
                          {varDef.enum.map(opt => (
                            <option key={String(opt)} value={String(opt)}>{String(opt)}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className={slot(t.variableInput)}
                          value={serverVariables[varName] ?? varDef.default}
                          onChange={(e) => onVarChange(varName, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={slot(t.resolvedSection)}>
              <p className={slot(t.resolvedLabel)}>Resolved URL</p>
              <code className={slot(t.resolvedValue)}>{resolvedUrl}</code>
            </div>

          </div>
        </div>
      )}
    </>
  );
}