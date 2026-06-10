/** Label row for a parameter or body field: name, location/type/required/deprecated badges, constraint badges, and description tooltip. */
import type { ThemeSlot } from "../../themes/slot";
import { slot } from "../../themes/slot";
import type { ThemeMode } from "../../themes/types";
import { useThemeMode } from "../../shared/contexts/theme-mode-context";

export interface ParamLabelTheme {
  nameText:        ThemeSlot;
  nameDeprecated:  ThemeSlot;
  locPath:         ThemeSlot;
  locQuery:        ThemeSlot;
  locHeader:       ThemeSlot;
  locCookie:       ThemeSlot;
  locForm:         ThemeSlot;
  locDefault:      ThemeSlot;
  typeBadge:       ThemeSlot;
  requiredBadge:   ThemeSlot;
  deprecatedBadge: ThemeSlot;
  constraintBadge: ThemeSlot;
  tooltipIcon:     ThemeSlot;
  tooltipPopup:    ThemeSlot;
}

export const paramLabelTheme: Record<ThemeMode, ParamLabelTheme> = {
  default: {
    nameText:        'font-mono text-[11px] text-gray-800',
    nameDeprecated:  'font-mono text-[11px] line-through text-gray-400',
    locPath:         'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-orange-600 bg-orange-50',
    locQuery:        'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-teal-600 bg-teal-50',
    locHeader:       'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-indigo-600 bg-indigo-50',
    locCookie:       'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-purple-600 bg-purple-50',
    locForm:         'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-blue-600 bg-blue-50',
    locDefault:      'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-gray-500 bg-gray-100',
    typeBadge:       'text-[9px] font-mono text-violet-600 bg-violet-50 rounded px-1.5 py-0.5 leading-none',
    requiredBadge:   'text-[9px] font-semibold text-red-500 bg-red-50 rounded px-1.5 py-0.5 leading-none',
    deprecatedBadge: 'text-[9px] font-semibold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 leading-none',
    constraintBadge: 'text-[9px] font-mono text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 leading-none',
    tooltipIcon:     'w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors',
    tooltipPopup:    'pointer-events-none absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-gray-900 px-2.5 py-2 text-[10px] text-gray-100 leading-snug shadow-lg opacity-0 group-hover/tip:opacity-100 transition-opacity z-50',
  },
  dark: {
    nameText:        'font-mono text-[11px] text-gray-200',
    nameDeprecated:  'font-mono text-[11px] line-through text-gray-500',
    locPath:         'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-orange-400 bg-orange-900/30',
    locQuery:        'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-teal-400 bg-teal-900/30',
    locHeader:       'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-indigo-400 bg-indigo-900/30',
    locCookie:       'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-purple-400 bg-purple-900/30',
    locForm:         'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-blue-400 bg-blue-900/30',
    locDefault:      'text-[9px] font-mono rounded px-1.5 py-0.5 leading-none text-gray-400 bg-gray-700',
    typeBadge:       'text-[9px] font-mono text-violet-400 bg-violet-900/30 rounded px-1.5 py-0.5 leading-none',
    requiredBadge:   'text-[9px] font-semibold text-red-400 bg-red-900/30 rounded px-1.5 py-0.5 leading-none',
    deprecatedBadge: 'text-[9px] font-semibold text-amber-400 bg-amber-900/30 rounded px-1.5 py-0.5 leading-none',
    constraintBadge: 'text-[9px] font-mono text-gray-400 bg-gray-700/60 rounded px-1.5 py-0.5 leading-none',
    tooltipIcon:     'w-3.5 h-3.5 text-gray-500 cursor-help hover:text-gray-300 transition-colors',
    tooltipPopup:    'pointer-events-none absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-gray-950 px-2.5 py-2 text-[10px] text-gray-100 leading-snug shadow-lg opacity-0 group-hover/tip:opacity-100 transition-opacity z-50',
  },
};

interface Props {
  name: string;
  location: string;
  typeBadge?: string;
  required: boolean;
  deprecated?: boolean;
  description?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  defaultValue?: unknown;
}

/**
 * Renders the label row for a single field.
 * Constraint badges appear on the right alongside location/type/required/deprecated.
 * The description tooltip is shown only when a description is present.
 */
export default function ParamLabel({
  name, location, typeBadge, required, deprecated, description,
  minimum, maximum, minLength, maxLength, pattern, defaultValue,
}: Props) {
  const t = paramLabelTheme[useThemeMode()];

  const locSlotMap: Record<string, ThemeSlot> = {
    path: t.locPath, query: t.locQuery, header: t.locHeader, cookie: t.locCookie, form: t.locForm,
  };
  const locSlot = locSlotMap[location] ?? t.locDefault;

  const constraints: string[] = [];
  if (minimum    !== undefined) constraints.push(`min: ${minimum}`);
  if (maximum    !== undefined) constraints.push(`max: ${maximum}`);
  if (minLength  !== undefined) constraints.push(`min length: ${minLength}`);
  if (maxLength  !== undefined) constraints.push(`max length: ${maxLength}`);
  if (pattern    !== undefined) constraints.push(`pattern: ${pattern.length > 14 ? pattern.slice(0, 14) + "…" : pattern}`);
  if (defaultValue !== undefined) constraints.push(`default: ${String(defaultValue)}`);

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={slot(deprecated ? t.nameDeprecated : t.nameText)}>
        {name}
      </span>
      <div className="flex-1" />
      <div className="flex items-center gap-1 flex-wrap justify-end">
        <span className={slot(locSlot)}>
          {location}
        </span>
        {typeBadge && (
          <span className={slot(t.typeBadge)}>
            {typeBadge}
          </span>
        )}
        {required && (
          <span className={slot(t.requiredBadge)}>required</span>
        )}
        {deprecated && (
          <span className={slot(t.deprecatedBadge)}>deprecated</span>
        )}
        {constraints.map(c => (
          <span key={c} className={slot(t.constraintBadge)}>{c}</span>
        ))}
        {description && (
          <span className="relative group/tip">
            <svg className={slot(t.tooltipIcon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className={slot(t.tooltipPopup)}>
              {description}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}