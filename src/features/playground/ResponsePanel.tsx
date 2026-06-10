/** Response viewer: handles loading, empty, and populated states with body/headers tabs. */
import { useState, useEffect, useMemo } from "react";
import type { PlaygroundResponse } from "../spec/openapi";
import { highlightJson } from "../../shared/utils/highlight";
import type { ThemeMode } from "../../themes/types";
import { useThemeMode } from "../../shared/contexts/theme-mode-context";
import { slot, type ThemeSlot } from "../../themes/slot";

interface Props {
  loading: boolean;
  response: PlaygroundResponse | null;
}

/** Theme slots for the ResponsePanel component. */
export interface ResponsePanelTheme {
  loadingState:  ThemeSlot;
  emptyState:    ThemeSlot;
  emptyText:     ThemeSlot;
  container:     ThemeSlot;
  tabBar:        ThemeSlot;
  tab:           ThemeSlot; // variant: active
  tabDivider:    ThemeSlot;
  headerCount:   ThemeSlot;
  copyButton:    ThemeSlot; // variant: copied
  statusNeutral: ThemeSlot;
  statusSuccess: ThemeSlot;
  statusError:   ThemeSlot;
  bodyContainer: ThemeSlot;
  bodyPre:       ThemeSlot;
  headersPre:    ThemeSlot;
}

export const responsePanelTheme: Record<ThemeMode, ResponsePanelTheme> = {
  default: {
    loadingState:  'shrink-0 border-t border-gray-100 h-16 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50/50',
    emptyState:    'shrink-0 border-t border-gray-100 h-10 flex items-center justify-center',
    emptyText:     'text-[10px] text-gray-300',
    container:     'h-full border-t border-gray-100 flex flex-col',
    tabBar:        'flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50 shrink-0',
    tab: {
      base:   'px-2.5 py-1 text-[10px] rounded font-medium transition-colors text-gray-400 hover:text-gray-600',
      active: 'bg-white shadow-sm text-gray-700 border border-gray-200',
    },
    tabDivider:    'w-px h-3 bg-gray-200 mx-1',
    headerCount:   'ml-0.5 text-gray-300',
    copyButton: {
      base:   'flex items-center gap-1 text-[10px] px-2 py-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700',
      copied: 'text-green-600',
    },
    statusNeutral: 'text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold text-gray-600 bg-gray-50 border-gray-200',
    statusSuccess: 'text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold text-green-600 bg-green-50 border-green-200',
    statusError:   'text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold text-red-600 bg-red-50 border-red-200',
    bodyContainer: 'flex-1 overflow-auto bg-white',
    bodyPre:       'text-[11px] p-3 text-gray-700 font-mono leading-relaxed',
    headersPre:    'text-[11px] p-3 text-gray-500 font-mono leading-relaxed',
  },
  dark: {
    loadingState:  'shrink-0 border-t border-gray-700 h-16 flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-800/30',
    emptyState:    'shrink-0 border-t border-gray-700 h-10 flex items-center justify-center',
    emptyText:     'text-[10px] text-gray-600',
    container:     'h-full border-t border-gray-700 flex flex-col',
    tabBar:        'flex items-center gap-2 px-4 py-2 border-b border-gray-700 bg-gray-800/30 shrink-0',
    tab: {
      base:   'px-2.5 py-1 text-[10px] rounded font-medium transition-colors text-gray-500 hover:text-gray-300',
      active: 'bg-gray-700 shadow-sm text-gray-200 border border-gray-600',
    },
    tabDivider:    'w-px h-3 bg-gray-700 mx-1',
    headerCount:   'ml-0.5 text-gray-600',
    copyButton: {
      base:   'flex items-center gap-1 text-[10px] px-2 py-1 rounded hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-300',
      copied: 'text-green-400',
    },
    statusNeutral: 'text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold text-gray-400 bg-gray-800 border-gray-600',
    statusSuccess: 'text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold text-green-400 bg-green-900/30 border-green-700',
    statusError:   'text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold text-red-400 bg-red-900/30 border-red-700',
    bodyContainer: 'flex-1 overflow-auto bg-gray-900',
    bodyPre:       'text-[11px] p-3 text-gray-300 font-mono leading-relaxed',
    headersPre:    'text-[11px] p-3 text-gray-400 font-mono leading-relaxed',
  },
};

/** Renders a spinner while loading, a placeholder when no response exists, or the tabbed response view. */
export default function ResponsePanel({ loading, response }: Props) {
  const t = responsePanelTheme[useThemeMode()];
  const [tab, setTab] = useState<"body" | "headers">("body");
  const [copied, setCopied] = useState(false);

  useEffect(() => { setTab("body"); }, [response]);

  const prettyBody = useMemo(() => {
    const body = response?.body ?? "";
    try { return JSON.stringify(JSON.parse(body), null, 2); } catch { return body; }
  }, [response]);

  const highlightedBody = useMemo(() => highlightJson(prettyBody), [prettyBody]);
  const headersText = Object.entries(response?.headers ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n");

  async function copyResponse() {
    await navigator.clipboard.writeText(prettyBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className={slot(t.loadingState)}>
        <svg className="animate-spin w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        Sending…
      </div>
    );
  }

  if (!response) {
    return (
      <div className={slot(t.emptyState)}>
        <span className={slot(t.emptyText)}>Response will appear here</span>
      </div>
    );
  }

  const statusOk = response.status >= 200 && response.status < 300;
  const statusBadgeClass = slot(response.status === 0 ? t.statusNeutral : statusOk ? t.statusSuccess : t.statusError);

  return (
    <div className={slot(t.container)}>
      <div className={slot(t.tabBar)}>
        <div className="flex gap-0.5">
          {(["body", "headers"] as const).map(tabName => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={slot(t.tab, { active: tab === tabName })}
            >
              {tabName === "headers"
                ? <><span>Headers</span> <span className={slot(t.headerCount)}>{Object.keys(response.headers).length}</span></>
                : "Body"}
            </button>
          ))}
        </div>
        <div className={slot(t.tabDivider)} />
        <span className={statusBadgeClass}>
          {response.status}{response.statusText ? ` ${response.statusText}` : ""}
        </span>
        <span className={statusBadgeClass}>{response.duration}ms</span>
        <div className="flex-1" />
        <button
          onClick={copyResponse}
          className={slot(t.copyButton, { copied })}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <div className={slot(t.bodyContainer)}>
        {tab === "body" ? (
          <pre
            className={slot(t.bodyPre)}
            dangerouslySetInnerHTML={{ __html: highlightedBody }}
          />
        ) : (
          <pre className={slot(t.headersPre)}>{headersText}</pre>
        )}
      </div>
    </div>
  );
}