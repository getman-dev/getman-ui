/** Three-state select for boolean parameters: absent (—), true, or false. */
import clsx from "clsx";

const base =
  "w-full text-xs border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 " +
  "text-gray-800 dark:text-gray-200 " +
  "focus:outline-none focus:ring-1 transition-colors font-mono";

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
  return (
    <select
      className={clsx(base, invalid
        ? "border-red-400 dark:border-red-500 focus:ring-red-400 focus:border-red-400"
        : "border-gray-200 dark:border-gray-600 focus:ring-blue-400 focus:border-blue-400")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">—</option>
      <option value="true">true</option>
      <option value="false">false</option>
    </select>
  );
}