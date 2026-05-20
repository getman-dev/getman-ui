/** Single-value select for parameters with a fixed enum set. */
import clsx from "clsx";

const base =
  "w-full text-xs border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 " +
  "text-gray-800 dark:text-gray-200 " +
  "focus:outline-none focus:ring-1 transition-colors font-mono";

interface Props {
  value: string;
  options: unknown[];
  required: boolean;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/** Renders a <select> with one option per enum value. Prepends a blank "—" option when the field is not required. */
export default function EnumSelect({ value, options, required, invalid, onChange }: Props) {
  return (
    <select
      className={clsx(base, invalid
        ? "border-red-400 dark:border-red-500 focus:ring-red-400 focus:border-red-400"
        : "border-gray-200 dark:border-gray-600 focus:ring-blue-400 focus:border-blue-400")}
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