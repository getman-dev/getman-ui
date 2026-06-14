/** URL preview bar and Send button for the playground. */
import type {EndpointEntry} from "../spec/openapi";
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
  const sendBarTheme = useTheme().sendBar;
  const endpointTheme = useTheme().endpoint;

  return (
      <div className={slot(sendBarTheme.container)}>
        <div className="flex items-stretch gap-2">
          <div className={slot(sendBarTheme.urlBox)}>
          <span
              className={slot(endpointTheme.methodBadge, {[endpoint.method.toLowerCase()]: true})}>
            {endpoint.method.toUpperCase()}
          </span>
            <code className={slot(sendBarTheme.urlCode)}>
              {window.decodeURIComponent(resolvedUrl)}
            </code>
          </div>
          <button
              disabled={!canExecute || loading}
              title={canExecute ? "Send request (⌘ Enter)" : "Fill required path parameters first"}
              onClick={onSend}
              className={canExecute && !loading ? slot(sendBarTheme.sendButtonActive) : slot(sendBarTheme.sendButtonDisabled)}
          >
            Send
          </button>
        </div>
      </div>
  );
}