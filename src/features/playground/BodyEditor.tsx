/** Request body editor: JSON textarea for application/json or a file input for application/octet-stream. */
import ParamLabel from "./ParamLabel";
import { slot } from "../../themes/slot";
import { useTheme } from "../../themes/context";

interface Props {
  required: boolean;
  contentType: string;
  bodyValue: string;
  onBodyChange: (value: string) => void;
  onRawFile: (file: File) => void;
}

/** Renders the body section. JSON bodies get a textarea with a Format button; binary bodies get a file input. */
export default function BodyEditor({ required, contentType, bodyValue, onBodyChange, onRawFile }: Props) {
  const t = useTheme().bodyEditor;

  function formatJson() {
    try { onBodyChange(JSON.stringify(JSON.parse(bodyValue), null, 2)); } catch { }
  }

  return (
    <div>
      <ParamLabel name="body" location="body" typeBadge={contentType} required={required} />

      {contentType === "application/octet-stream" ? (
        <input
          type="file"
          className={slot(t.fileInput)}
          onChange={(e) => { const f = e.target.files; if (f?.length) onRawFile(f[0]); }}
        />
      ) : (
        <div className="relative">
          <button onClick={formatJson} className={slot(t.formatButton)}>
            Format JSON
          </button>
          <textarea
            rows={8}
            value={bodyValue}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Enter JSON body…"
            className={slot(t.textarea)}
          />
        </div>
      )}
    </div>
  );
}