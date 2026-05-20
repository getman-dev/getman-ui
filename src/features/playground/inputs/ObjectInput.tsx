/** JSON textarea for object-typed parameters. */
import clsx from "clsx";

const base =
  "w-full text-xs border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 " +
  "text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 transition-colors font-mono resize-y";

interface Props {
  value: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/** Renders a resizable textarea pre-configured for JSON object input. */
export default function ObjectInput({ value, invalid, onChange }: Props) {
  return (
    <textarea
      rows={3}
      className={clsx(base, invalid
        ? "border-red-400 dark:border-red-500 focus:ring-red-400 focus:border-red-400"
        : "border-gray-200 dark:border-gray-600 focus:ring-blue-400 focus:border-blue-400")}
      placeholder='{"key": "value"}'
      value={value}
      onInput={(e) => onChange((e.target as HTMLTextAreaElement).value)}
    />
  );
}