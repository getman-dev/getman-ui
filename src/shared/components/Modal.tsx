/** Reusable modal shell: dimmed backdrop, container, header with close button, and footer slot. */
import type { ReactNode } from "react";

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
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50"
      style={{ minHeight: "100vh" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full ${maxWidth} mx-4 overflow-hidden${scrollable ? " max-h-[90vh] flex flex-col" : ""}`}>

        <div className={`flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700${scrollable ? " shrink-0" : ""}`}>
          {title}
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {scrollable ? (
          <div className="overflow-y-auto flex-1">{children}</div>
        ) : (
          children
        )}

        {footer != null && (
          <div className={`px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700${scrollable ? " shrink-0" : ""}`}>
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}