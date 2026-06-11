/** Single-value select for parameters with a fixed enum set. */
import { slot } from "../../../themes/slot";
import { useTheme } from "../../../themes/context";

interface Props {
  value: string;
  options: unknown[];
  required: boolean;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/** Renders a <select> with one option per enum value. Prepends a blank "—" option when the field is not required. */
export default function EnumSelect({ value, options, required, invalid, onChange }: Props) {
  const t = useTheme().inputEnum;
  return (
    <select
      className={invalid ? slot(t.selectInvalid) : slot(t.select)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {!required && <option value="">—</option>}
      {options.map(v => (
        <option key={String(v)} value={String(v)}>{String(v)}</option>
      ))}
    </select>
  );
}