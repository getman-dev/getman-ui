/** Three-state select for boolean parameters: absent (—), true, or false. */
import type { ThemeSlot } from "../../../themes/slot";
import { slot } from "../../../themes/slot";
import type { ThemeMode } from "../../../themes/types";
import { useThemeMode } from "../../../shared/contexts/theme-mode-context";

export interface BooleanSelectTheme {
  select:        ThemeSlot;
  selectInvalid: ThemeSlot;
}

export const booleanSelectTheme: Record<ThemeMode, BooleanSelectTheme> = {
  default: {
    select:        'w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
    selectInvalid: 'w-full text-xs border border-red-400 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono',
  },
  dark: {
    select:        'w-full text-xs border border-gray-600 rounded-lg px-3 py-2 bg-gray-800 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors font-mono',
    selectInvalid: 'w-full text-xs border border-red-500 rounded-lg px-3 py-2 bg-gray-800 text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-colors font-mono',
  },
};

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
  const t = booleanSelectTheme[useThemeMode()];
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