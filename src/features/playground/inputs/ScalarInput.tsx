/** Text or number input for scalar parameter values (string, integer, number). */
import type { ThemeSlot } from "../../../themes/slot";
import { slot } from "../../../themes/slot";
import type { ThemeMode } from "../../../themes/types";
import { useThemeMode } from "../../../shared/contexts/theme-mode-context";

export interface ScalarInputTheme {
  input:        ThemeSlot;
  inputInvalid: ThemeSlot;
}

export const scalarInputTheme: Record<ThemeMode, ScalarInputTheme> = {
  default: {
    input:        'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
    inputInvalid: 'w-full text-xs border border-red-400 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono',
  },
  dark: {
    input:        'w-full text-xs border border-gray-600 rounded-lg px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
    inputInvalid: 'w-full text-xs border border-red-500 rounded-lg px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono',
  },
};

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
  const t = scalarInputTheme[useThemeMode()];
  const isNumeric = type === "integer" || type === "number";
  return (
    <input
      type={isNumeric ? "number" : "text"}
      className={invalid ? slot(t.inputInvalid) : slot(t.input)}
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