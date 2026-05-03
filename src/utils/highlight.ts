import { escapeHtml } from "./html";

// Regex matches (in order): keys, strings, true/false, null, numbers
// Operates on already-HTML-escaped text, so quotes appear as &quot;
const TOKEN_RE =
  /(&quot;(?:[^&]|&(?!quot;))*&quot;(?:\s*:)?|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

function tokenClass(token: string): string {
  if (token.endsWith(":"))      return "color:var(--hl-key)";
  if (token.startsWith("&"))    return "color:var(--hl-str)";
  if (token === "true")         return "color:var(--hl-bool)";
  if (token === "false")        return "color:var(--hl-bool)";
  if (token === "null")         return "color:var(--hl-null)";
  return                               "color:var(--hl-num)";
}

export function highlightJson(raw: string): string {
  // Bail out for non-JSON and very large payloads
  const trimmed = raw.trimStart();
  if ((trimmed[0] !== "{" && trimmed[0] !== "[") || raw.length > 200_000) {
    return escapeHtml(raw);
  }
  return escapeHtml(raw).replace(TOKEN_RE, (m) => `<span style="${tokenClass(m)}">${m}</span>`);
}