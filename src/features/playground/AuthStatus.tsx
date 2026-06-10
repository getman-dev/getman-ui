/** Security scheme status rows shown above the parameter list in the playground. */
import type { SecurityScheme, AuthValues } from "../spec/openapi";
import type { ThemeSlot } from "../../themes/slot";
import { slot } from "../../themes/slot";
import type { ThemeMode } from "../../themes/types";
import { useThemeMode } from "../../shared/contexts/theme-mode-context";

export interface AuthStatusTheme {
  sectionLabel:      ThemeSlot;
  emptyText:         ThemeSlot;
  schemeRow:         ThemeSlot;
  schemeName:        ThemeSlot;
  schemeType:        ThemeSlot;
  authorizedBadge:   ThemeSlot;
  unauthorizedBadge: ThemeSlot;
}

export const authStatusTheme: Record<ThemeMode, AuthStatusTheme> = {
  default: {
    sectionLabel:      'text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3',
    emptyText:         'text-[10px] text-gray-400',
    schemeRow:         'flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-100 bg-gray-50/60',
    schemeName:        'text-[11px] font-mono text-gray-700',
    schemeType:        'ml-1.5 text-[10px] text-gray-400',
    authorizedBadge:   'text-[9px] text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide',
    unauthorizedBadge: 'text-[9px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 uppercase tracking-wide',
  },
  dark: {
    sectionLabel:      'text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3',
    emptyText:         'text-[10px] text-gray-500',
    schemeRow:         'flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-700 bg-gray-700/30',
    schemeName:        'text-[11px] font-mono text-gray-300',
    schemeType:        'ml-1.5 text-[10px] text-gray-500',
    authorizedBadge:   'text-[9px] text-green-400 bg-green-900/30 border border-green-700 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide',
    unauthorizedBadge: 'text-[9px] text-gray-500 bg-gray-700 border border-gray-600 rounded px-1.5 py-0.5 uppercase tracking-wide',
  },
};

interface Props {
  schemeNames: string[] | null;
  allSchemes: Record<string, SecurityScheme>;
  authValues: AuthValues;
}

function schemeShortLabel(type: string, schemeOrIn?: string): string {
  if (type === "apiKey")        return `API Key (${schemeOrIn ?? "header"})`;
  if (type === "http")          return `HTTP ${schemeOrIn ?? "bearer"}`;
  if (type === "oauth2")        return "OAuth 2.0";
  if (type === "openIdConnect") return "OpenID Connect";
  return type;
}

/**
 * Renders a row per applicable security scheme showing its name, type, and authorization status.
 * Renders nothing when schemeNames is null or no schemes are defined on the spec.
 */
export default function AuthStatus({ schemeNames, allSchemes, authValues }: Props) {
  const t = authStatusTheme[useThemeMode()];

  if (schemeNames === null || Object.keys(allSchemes).length === 0) return null;

  return (
    <div>
      <p className={slot(t.sectionLabel)}>Authorization</p>
      {schemeNames.length === 0 ? (
        <p className={slot(t.emptyText)}>No authentication required for this endpoint.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {schemeNames.filter(n => allSchemes[n]).map(n => {
            const scheme     = allSchemes[n];
            const val        = authValues[n];
            const authorized = !!(val?.value || val?.username);
            return (
              <div key={n} className={slot(t.schemeRow)}>
                <div>
                  <span className={slot(t.schemeName)}>{n}</span>
                  <span className={slot(t.schemeType)}>
                    {schemeShortLabel(scheme.type, scheme.in ?? scheme.scheme)}
                  </span>
                </div>
                {authorized
                  ? <span className={slot(t.authorizedBadge)}>Authorized</span>
                  : <span className={slot(t.unauthorizedBadge)}>Not set</span>
                }
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}