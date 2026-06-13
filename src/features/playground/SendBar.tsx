/** URL preview bar and Send button for the playground. */
import type {EndpointEntry} from "../spec/openapi";
import {methodBadgeClasses} from "../../shared/utils/badges";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface SendBarTheme {
  container: ThemeSlot;
  urlBox: ThemeSlot;
  urlCode: ThemeSlot;
  sendButtonActive: ThemeSlot;
  sendButtonDisabled: ThemeSlot;
}

interface Props {
  endpoint: EndpointEntry;
  resolvedUrl: string;
  canExecute: boolean;
  loading: boolean;
  onSend: () => void;
}

/** Renders the resolved URL with a method badge on the left and a Send button on the right. */
export default function SendBar({endpoint, resolvedUrl, canExecute, loading, onSend}: Props) {
  const t = useTheme().sendBar;
  return (
      <div className={slot(t.container)}>
        <div className="flex items-stretch gap-2">
          <div className={slot(t.urlBox)}>
          <span
              className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${methodBadgeClasses(endpoint.method)}`}>
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