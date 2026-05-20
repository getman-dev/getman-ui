/** Text or number input for scalar parameter values (string, integer, number). */
import clsx from "clsx";

const base =
  "w-full text-xs border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 " +
  "text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 transition-colors font-mono";

interface Props {
  value: string;
  name: string;
  type?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  example?: unknown;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/** Renders a text or number input, wiring constraint props to the matching HTML attributes. */
export default function ScalarInput({ value, name, type, minimum, maximum, minLength, maxLength, pattern, example, invalid, onChange }: Props) {
  const isNumeric = type === "integer" || type === "number";
  return (
    <input
      type={isNumeric ? "number" : "text"}
      className={clsx(base, invalid
        ? "border-red-400 dark:border-red-500 focus:ring-red-400 focus:border-red-400"
        : "border-gray-200 dark:border-gray-600 focus:ring-blue-400 focus:border-blue-400")}
      value={value}
      placeholder={example != null ? String(example) : name}
      min={minimum}
      max={maximum}
      minLength={minLength}
      maxLength={maxLength}
      pattern={pattern}
      onInput={(e) => onChange((e.target as HTMLInputElement).value)}
    />
  );
}