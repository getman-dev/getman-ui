/** Response viewer: handles loading, empty, and populated states with body/headers tabs. */
import {useEffect, useMemo, useState} from "react";
import type {PlaygroundResponse} from "../spec/openapi";
import {highlightJson} from "../../shared/utils/highlight";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface ResponsePanelTheme {
  loadingState: ThemeSlot;
  emptyState: ThemeSlot;
  emptyText: ThemeSlot;
  container: ThemeSlot;
  tabBar: ThemeSlot;
  tab: ThemeSlot; // variant: active
  tabDivider: ThemeSlot;
  headerCount: ThemeSlot;
  copyButton: ThemeSlot; // variant: copied
  statusNeutral: ThemeSlot;
  statusSuccess: ThemeSlot;
  statusError: ThemeSlot;
  bodyContainer: ThemeSlot;
  bodyPre: ThemeSlot;
  headersPre: ThemeSlot;
}

interface Props {
  loading: boolean;
  response: PlaygroundResponse | null;
}

/** Renders a spinner while loading, a placeholder when no response exists, or the tabbed response view. */
export default function ResponsePanel({ loading, response }: Props) {
  const t = useTheme().responsePanel;
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