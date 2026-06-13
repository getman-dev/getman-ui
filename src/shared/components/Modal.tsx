/** Reusable modal shell: dimmed backdrop, container, header with close button, and footer slot. */
import type {ReactNode} from "react";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface ModalTheme {
  backdrop: ThemeSlot;
  container: ThemeSlot;
  header: ThemeSlot;
  closeButton: ThemeSlot;
  footer: ThemeSlot;
}

interface ModalProps {
  /** Whether the modal is rendered. */
  visible: boolean;
  /** Called when the backdrop or the close button is clicked. */
  onClose: () => void;
  /** Left side of the header row — typically an h2 or an icon+h2 group. */
  title: ReactNode;
  /** Modal body content. */
  children: ReactNode;
  /** Content for the gray footer bar. Consumer owns the inner flex layout. */
  footer?: ReactNode;
  /** Tailwind max-width class applied to the container. Defaults to "max-w-md". */
  maxWidth?: string;
  /** When true, caps height at 90vh and makes the body region vertically scrollable. */
  scrollable?: boolean;
}

/** Modal shell with a dimmed backdrop, a header, an optional scrollable body, and a footer slot. */
export default function Modal({
                                visible,
                                onClose,
                                title,
                                children,
                                footer,
                                maxWidth = "max-w-md",
                                scrollable = false,
                              }: ModalProps) {
  const t = useTheme().modal;

  if (!visible) return null;

  return (
      <div
          className={slot(t.backdrop)}
          style={{minHeight: "100vh"}}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
      >
        <div className={`${slot(t.container)} ${maxWidth}${scrollable ? " max-h-[90vh] flex flex-col" : ""}`}>

          <div className={`${slot(t.header)}${scrollable ? " shrink-0" : ""}`}>
            {title}
            <button onClick={onClose} className={slot(t.closeButton)}>×</button>
          </div>

          {scrollable ? (
              <div className="overflow-y-auto flex-1">{children}</div>
          ) : (
              children
          )}

          {footer != null && (
              <div className={`${slot(t.footer)}${scrollable ? " shrink-0" : ""}`}>
                {footer}
              </div>
          )}

        </div>
      </div>
  );
}