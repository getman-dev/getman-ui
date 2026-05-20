/** Label row for a parameter or body field: name, location/type/required/deprecated badges, constraint badges, and description tooltip. */

const LOCATION_BADGE: Record<string, string> = {
  path:   "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30",
  query:  "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30",
  header: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30",
  cookie: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30",
  form:   "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30",
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
  const locClass = LOCATION_BADGE[location] ?? "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";

  const constraints: string[] = [];
  if (minimum    !== undefined) constraints.push(`min: ${minimum}`);
  if (maximum    !== undefined) constraints.push(`max: ${maximum}`);
  if (minLength  !== undefined) constraints.push(`min length: ${minLength}`);
  if (maxLength  !== undefined) constraints.push(`max length: ${maxLength}`);
  if (pattern    !== undefined) constraints.push(`pattern: ${pattern.length > 14 ? pattern.slice(0, 14) + "…" : pattern}`);
  if (defaultValue !== undefined) constraints.push(`default: ${String(defaultValue)}`);

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={`font-mono text-[11px] ${deprecated ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"}`}>
        {name}
      </span>
      <div className="flex-1" />
      <div className="flex items-center gap-1 flex-wrap justify-end">
        <span className={`text-[9px] font-mono rounded px-1.5 py-0.5 leading-none ${locClass}`}>
          {location}
        </span>
        {typeBadge && (
          <span className="text-[9px] font-mono text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 rounded px-1.5 py-0.5 leading-none">
            {typeBadge}
          </span>
        )}
        {required && (
          <span className="text-[9px] font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded px-1.5 py-0.5 leading-none">
            required
          </span>
        )}
        {deprecated && (
          <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded px-1.5 py-0.5 leading-none">
            deprecated
          </span>
        )}
        {constraints.map(c => (
          <span key={c} className="text-[9px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/60 rounded px-1.5 py-0.5 leading-none">
            {c}
          </span>
        ))}
        {description && (
          <span className="relative group/tip">
            <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help hover:text-gray-600 dark:hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="pointer-events-none absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-gray-900 dark:bg-gray-950 px-2.5 py-2 text-[10px] text-gray-100 leading-snug shadow-lg opacity-0 group-hover/tip:opacity-100 transition-opacity z-50">
              {description}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}