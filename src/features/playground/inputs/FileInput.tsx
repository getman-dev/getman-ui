/** File upload input for binary-format fields in multipart/form-data request bodies. */

const fileInputClass =
  "block w-full text-xs text-gray-600 dark:text-gray-400 cursor-pointer " +
  "file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 " +
  "file:text-xs file:font-medium file:bg-blue-50 dark:file:bg-blue-900/40 " +
  "file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/60";

interface Props {
  multiple: boolean;
  onFileChange: (files: FileList) => void;
}

/** Renders a file input. Pass multiple=true for array-of-binary (file[]) fields. */
export default function FileInput({ multiple, onFileChange }: Props) {
  return (
    <input
      type="file"
      multiple={multiple}
      className={fileInputClass}
      onChange={(e) => { const f = e.target.files; if (f?.length) onFileChange(f); }}
    />
  );
}