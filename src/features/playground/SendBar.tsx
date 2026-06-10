/** URL preview bar and Send button for the playground. */
import type { EndpointEntry } from "../spec/openapi";
import { methodBadgeClasses } from "../../shared/utils/badges";
import type { ThemeSlot } from "../../themes/slot";
import { slot } from "../../themes/slot";
import type { ThemeMode } from "../../themes/types";
import { useThemeMode } from "../../shared/contexts/theme-mode-context";

export interface SendBarTheme {
  container:          ThemeSlot;
  urlBox:             ThemeSlot;
  urlCode:            ThemeSlot;
  sendButtonActive:   ThemeSlot;
  sendButtonDisabled: ThemeSlot;
}

export const sendBarTheme: Record<ThemeMode, SendBarTheme> = {
  default: {
    container:          'px-5 py-3 border-b border-gray-100 shrink-0 bg-gray-50/50',
    urlBox:             'flex items-center gap-2 flex-1 min-w-0 bg-white rounded-lg px-2.5 py-2 border border-gray-200',
    urlCode:            'text-[10px] text-gray-600 leading-tight flex-1 min-w-0 break-all',
    sendButtonActive:   'shrink-0 px-4 rounded-lg text-xs font-semibold transition-all bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm',
    sendButtonDisabled: 'shrink-0 px-4 rounded-lg text-xs font-semibold transition-all bg-gray-100 text-gray-400 cursor-not-allowed',
  },
  dark: {
    container:          'px-5 py-3 border-b border-gray-700 shrink-0 bg-gray-800/30',
    urlBox:             'flex items-center gap-2 flex-1 min-w-0 bg-gray-800 rounded-lg px-2.5 py-2 border border-gray-600',
    urlCode:            'text-[10px] text-gray-400 leading-tight flex-1 min-w-0 break-all',
    sendButtonActive:   'shrink-0 px-4 rounded-lg text-xs font-semibold transition-all bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm',
    sendButtonDisabled: 'shrink-0 px-4 rounded-lg text-xs font-semibold transition-all bg-gray-700 text-gray-500 cursor-not-allowed',
  },
};

interface Props {
  endpoint: EndpointEntry;
  resolvedUrl: string;
  canExecute: boolean;
  loading: boolean;
  onSend: () => void;
}

/** Renders the resolved URL with a method badge on the left and a Send button on the right. */
export default function SendBar({ endpoint, resolvedUrl, canExecute, loading, onSend }: Props) {
  const t = sendBarTheme[useThemeMode()];
  return (
    <div className={slot(t.container)}>
      <div className="flex items-stretch gap-2">
        <div className={slot(t.urlBox)}>
          <span className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${methodBadgeClasses(endpoint.method)}`}>
            {endpoint.method.toUpperCase()}
          </span>
          <code className={slot(t.urlCode)}>
            {window.decodeURIComponent(resolvedUrl)}
          </code>
        </div>
        <button
          disabled={!canExecute || loading}
          title={canExecute ? "Send request (⌘ Enter)" : "Fill required path parameters first"}
          onClick={onSend}
          className={canExecute && !loading ? slot(t.sendButtonActive) : slot(t.sendButtonDisabled)}
        >
          Send
        </button>
      </div>
    </div>
  );
}