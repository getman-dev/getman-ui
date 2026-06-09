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

export interface ServerConfigTheme {
  chip:               ThemeSlot; // variants: open
  popover:            ThemeSlot;
  serverOption:       ThemeSlot; // variants: selected
  variableLabel:      ThemeSlot;
  variableInput:      ThemeSlot; // variants: focused
  variableDescription:ThemeSlot;
}

interface Props {
  source: "topbar" | "playground";
}

const chipBase    = "flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-colors shrink-0";
const chipOpen    = "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700";
const chipClosed  = "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500";
const inputBase   = "text-[11px] font-mono border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full";

/** Renders the server chip and, when open, a modal to pick a server and set variables. */
export default function ServerConfig({ source }: Props) {
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
      <button className={clsx(chipBase, isOpen ? chipOpen : chipClosed)} onClick={openPanel}>
        <svg className="w-3 h-3 shrink-0 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
        </svg>
        <span className="truncate max-w-[240px]">{resolvedUrl}</span>
        <svg className={clsx("w-3 h-3 opacity-50 transition-transform shrink-0", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-[60]"
          style={{ minHeight: "100vh" }}
          onClick={onBackdropClick}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Server</h2>
              </div>
              <button onClick={closePanel} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">×</button>
            </div>

            {servers.length > 1 && (
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Server</label>
                <select
                  className="w-full text-[11px] font-mono border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
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
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Variables</label>
                <div className="flex flex-col gap-3">
                  {varEntries.map(([varName, varDef]) => (
                    <div key={varName} className="flex items-start gap-3">
                      <div className="w-24 shrink-0 pt-1.5">
                        <p className="text-[11px] font-mono font-medium text-gray-700 dark:text-gray-300">{varName}</p>
                        {varDef.description && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{varDef.description}</p>
                        )}
                      </div>
                      {varDef.enum?.length ? (
                        <select
                          className={clsx(inputBase, "cursor-pointer")}
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
                          className={inputBase}
                          value={serverVariables[varName] ?? varDef.default}
                          onChange={(e) => onVarChange(varName, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-5 py-4 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Resolved URL</p>
              <code className="text-[11px] font-mono text-gray-700 dark:text-gray-300 break-all">{resolvedUrl}</code>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
