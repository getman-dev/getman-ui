/** URL preview bar and Send button for the playground. */
import clsx from "clsx";
import type { EndpointEntry } from "../spec/openapi";
import { methodBadgeClasses } from "../../shared/utils/badges";

interface Props {
  endpoint: EndpointEntry;
  resolvedUrl: string;
  canExecute: boolean;
  loading: boolean;
  onSend: () => void;
}

/** Renders the resolved URL with a method badge on the left and a Send button on the right. */
export default function SendBar({ endpoint, resolvedUrl, canExecute, loading, onSend }: Props) {
  return (
    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="flex items-stretch gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg px-2.5 py-2 border border-gray-200 dark:border-gray-600 ">
          <span className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${methodBadgeClasses(endpoint.method)}`}>
            {endpoint.method.toUpperCase()}
          </span>
          <code className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight flex-1 min-w-0 break-all">
            {window.decodeURIComponent(resolvedUrl)}
          </code>
        </div>
        <button
          disabled={!canExecute || loading}
          title={canExecute ? "Send request (⌘ Enter)" : "Fill required path parameters first"}
          onClick={onSend}
          className={clsx(
            "shrink-0 px-4 rounded-lg text-xs font-semibold transition-all",
            canExecute && !loading
              ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed",
          )}
        >
          Send
        </button>
      </div>
    </div>
  );
}