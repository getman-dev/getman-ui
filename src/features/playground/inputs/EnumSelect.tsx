/** Single-value select for parameters with a fixed enum set. */
import type { ThemeSlot } from "../../../themes/slot";
import { slot } from "../../../themes/slot";
import type { ThemeMode } from "../../../themes/types";
import { useThemeMode } from "../../../shared/contexts/theme-mode-context";

export interface EnumSelectTheme {
  select:        ThemeSlot;
  selectInvalid: ThemeSlot;
}

export const enumSelectTheme: Record<ThemeMode, EnumSelectTheme> = {
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
  options: unknown[];
  required: boolean;
  invalid?: boolean;
  onChange: (value: string) => void;
}

/** Renders a <select> with one option per enum value. Prepends a blank "—" option when the field is not required. */
export default function EnumSelect({ value, options, required, invalid, onChange }: Props) {
  const t = enumSelectTheme[useThemeMode()];
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