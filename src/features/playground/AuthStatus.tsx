/** Security scheme status rows shown above the parameter list in the playground. */
import type { SecurityScheme, AuthValues } from "../spec/openapi";

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
  if (schemeNames === null || Object.keys(allSchemes).length === 0) return null;

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Authorization</p>
      {schemeNames.length === 0 ? (
        <p className="text-[10px] text-gray-400 dark:text-gray-500">No authentication required for this endpoint.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {schemeNames.filter(n => allSchemes[n]).map(n => {
            const scheme     = allSchemes[n];
            const val        = authValues[n];
            const authorized = !!(val?.value || val?.username);
            return (
              <div key={n} className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/30">
                <div>
                  <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300">{n}</span>
                  <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                    {schemeShortLabel(scheme.type, scheme.in ?? scheme.scheme)}
                  </span>
                </div>
                {authorized
                  ? <span className="text-[9px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide">Authorized</span>
                  : <span className="text-[9px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 uppercase tracking-wide">Not set</span>
                }
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}