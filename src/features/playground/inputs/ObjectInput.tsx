/** JSON textarea for object-typed parameters. */
import type { ThemeSlot } from "../../../themes/slot";
import { slot } from "../../../themes/slot";
import type { ThemeMode } from "../../../themes/types";
import { useThemeMode } from "../../../shared/contexts/theme-mode-context";

export interface ObjectInputTheme {
  textarea:        ThemeSlot;
  textareaInvalid: ThemeSlot;
}

export const objectInputTheme: Record<ThemeMode, ObjectInputTheme> = {
  default: {
    textarea:        'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono resize-y',
    textareaInvalid: 'w-full text-xs border border-red-400 rounded-lg px-3 py-2 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono resize-y',
  },
  dark: {
    textarea:        'w-full text-xs border border-gray-600 rounded-lg px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono resize-y',
    textareaInvalid: 'w-full text-xs border border-red-500 rounded-lg px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono resize-y',
  },
};

interface Props {
  value: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/** Renders a resizable textarea pre-configured for JSON object input. */
export default function ObjectInput({ value, invalid, onChange }: Props) {
  const t = objectInputTheme[useThemeMode()];
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