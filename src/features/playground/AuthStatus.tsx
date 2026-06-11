/** Security scheme status rows shown above the parameter list in the playground. */
import type { SecurityScheme, AuthValues } from "../spec/openapi";
import { slot } from "../../themes/slot";
import { useTheme } from "../../themes/context";

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
  const t = useTheme().authStatus;

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