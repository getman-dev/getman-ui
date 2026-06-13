/** JSON textarea for object-typed parameters. */
import {slot, type ThemeSlot} from "../../../themes/slot";
import {useTheme} from "../../../themes/context";

export interface ObjectInputTheme {
  textarea: ThemeSlot;
  textareaInvalid: ThemeSlot;
}

interface Props {
  value: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/** Renders a resizable textarea pre-configured for JSON object input. */
export default function ObjectInput({value, invalid, onChange}: Props) {
  const t = useTheme().inputObject;
  return (
      <textarea
          rows={3}
          className={invalid ? slot(t.textareaInvalid) : slot(t.textarea)}
          placeholder='{"key": "value"}'
          value={value}
          onInput={(e) => onChange((e.target as HTMLTextAreaElement).value)}
      />
  );
}