/** Label row for a parameter or body field: name, location/type/required/deprecated badges, constraint badges, and description tooltip. */
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface ParamLabelTheme {
  nameText: ThemeSlot;
  nameDeprecated: ThemeSlot;
  locPath: ThemeSlot;
  locQuery: ThemeSlot;
  locHeader: ThemeSlot;
  locCookie: ThemeSlot;
  locForm: ThemeSlot;
  locDefault: ThemeSlot;
  typeBadge: ThemeSlot;
  requiredBadge: ThemeSlot;
  deprecatedBadge: ThemeSlot;
  constraintBadge: ThemeSlot;
  tooltipIcon: ThemeSlot;
  tooltipPopup: ThemeSlot;
}

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
  const t = useTheme().paramLabel;

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