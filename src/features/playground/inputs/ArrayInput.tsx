/** Free-text comma-separated input for array parameters with no fixed enum set. */
import clsx from "clsx";

const base =
  "w-full text-xs border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 " +
  "text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 transition-colors font-mono";

interface Props {
  value: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/** Renders a text input with a "comma-separated" hint badge beneath it. */
export default function ArrayInput({ value, invalid, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        className={clsx(base, invalid
          ? "border-red-400 dark:border-red-500 focus:ring-red-400 focus:border-red-400"
          : "border-gray-200 dark:border-gray-600 focus:ring-blue-400 focus:border-blue-400")}
        value={value}
        placeholder="value1,value2,…"
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
      />
      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">comma-separated</span>
    </div>
  );
}