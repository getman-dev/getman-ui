/** File upload input for binary-format fields in multipart/form-data request bodies. */
import {slot, type ThemeSlot} from "../../../themes/slot";
import {useTheme} from "../../../themes/context";

export interface FileInputTheme {
  input: ThemeSlot;
}

interface Props {
  multiple: boolean;
  onFileChange: (files: FileList) => void;
}

/** Renders a file input. Pass multiple=true for array-of-binary (file[]) fields. */
export default function FileInput({multiple, onFileChange}: Props) {
  const t = useTheme().inputFile;
  return (
      <input
          type="file"
          multiple={multiple}
          className={slot(t.input)}
          onChange={(e) => {
            const f = e.target.files;
            if (f?.length) onFileChange(f);
          }}
      />
  );
}