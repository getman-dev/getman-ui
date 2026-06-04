/** Request body editor: JSON textarea for application/json or a file input for application/octet-stream. */
import ParamLabel from "./ParamLabel";

const fileInputClass =
  "block w-full text-xs text-gray-600 dark:text-gray-400 cursor-pointer " +
  "file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 " +
  "file:text-xs file:font-medium file:bg-blue-50 dark:file:bg-blue-900/40 " +
  "file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/60";

interface Props {
  required: boolean;
  contentType: string;
  bodyValue: string;
  onBodyChange: (value: string) => void;
  onRawFile: (file: File) => void;
}

/** Renders the body section. JSON bodies get a textarea with a Format button; binary bodies get a file input. */
export default function BodyEditor({ required, contentType, bodyValue, onBodyChange, onRawFile }: Props) {
  function formatJson() {
    try { onBodyChange(JSON.stringify(JSON.parse(bodyValue), null, 2)); } catch { }
  }

  return (
    <div>
      <ParamLabel name="body" location="body" typeBadge={contentType} required={required} />

      {contentType === "application/octet-stream" ? (
        <input
          type="file"
          className={fileInputClass}
          onChange={(e) => { const f = e.target.files; if (f?.length) onRawFile(f[0]); }}
        />
      ) : (
        <div className="relative">
          <button
            onClick={formatJson}
            className="absolute top-1.5 right-1.5 z-10 text-[10px] text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-1.5 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            Format JSON
          </button>
          <textarea
            rows={8}
            value={bodyValue}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Enter JSON body…"
            className="w-full text-[11px] border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono resize-y transition-colors leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}