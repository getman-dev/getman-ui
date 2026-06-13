/** Three-state select for boolean parameters: absent (—), true, or false. */
import {slot, type ThemeSlot} from "../../../themes/slot";
import {useTheme} from "../../../themes/context";

export interface BooleanSelectTheme {
  select: ThemeSlot;
  selectInvalid: ThemeSlot;
}

interface Props {
  value: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/**
 * Renders a <select> with —/true/false options.
 * A blank value means the parameter is not sent — distinct from explicitly sending false.
 */
export default function BooleanSelect({ value, invalid, onChange }: Props) {
  const t = useTheme().inputBoolean;
  return (
    <select
      className={invalid ? slot(t.selectInvalid) : slot(t.select)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">—</option>
      <option value="true">true</option>
      <option value="false">false</option>
    </select>
  );
}