/** Response viewer: handles loading, empty, and populated states with body/headers tabs. */
import { useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import type { PlaygroundResponse } from "../spec/openapi";
import { highlightJson } from "../../shared/utils/highlight";

interface Props {
  loading: boolean;
  response: PlaygroundResponse | null;
}

/** Renders a spinner while loading, a placeholder when no response exists, or the tabbed response view. */
export default function ResponsePanel({ loading, response }: Props) {
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
      <div className="shrink-0 border-t border-gray-100 dark:border-gray-700 h-16 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30">
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
      <div className="shrink-0 border-t border-gray-100 dark:border-gray-700 h-10 flex items-center justify-center">
        <span className="text-[10px] text-gray-300 dark:text-gray-600">Response will appear here</span>
      </div>
    );
  }

  const statusOk = response.status >= 200 && response.status < 300;
  const statusColor = response.status === 0
    ? "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
    : statusOk
      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700"
      : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700";

  return (
    <div className="h-full border-t border-gray-100 dark:border-gray-700 flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 shrink-0">
        <span className={`text-[10px] border rounded px-1.5 py-0.5 font-mono font-semibold ${statusColor}`}>
          {response.status}{response.statusText ? ` ${response.statusText}` : ""}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{response.duration}ms</span>
        <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-1" />
        <div className="flex gap-0.5">
          {(["body", "headers"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                "px-2.5 py-1 text-[10px] rounded font-medium transition-colors",
                tab === t
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
              )}
            >
              {t === "headers"
                ? <><span>Headers</span> <span className="ml-0.5 text-gray-300 dark:text-gray-600">{Object.keys(response.headers).length}</span></>
                : "Body"}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={copyResponse}
          className={clsx(
            "flex items-center gap-1 text-[10px] px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            copied ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
          )}
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

      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        {tab === "body" ? (
          <pre
            className="text-[11px] p-3 text-gray-700 dark:text-gray-300 font-mono leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedBody }}
          />
        ) : (
          <pre className="text-[11px] p-3 text-gray-500 dark:text-gray-400 font-mono leading-relaxed">{headersText}</pre>
        )}
      </div>
    </div>
  );
}