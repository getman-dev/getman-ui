/** Recursive component that renders a single OpenAPI schema property row with type, constraints, and nested children. */
import type { Schema, Components } from "../spec/openapi";
import { resolveSchema } from "../spec/ref-resolver";

interface Props {
  name: string;
  schema: Schema | undefined;
  components: Components | undefined;
  depth?: number;
  required?: boolean;
}

function typeBadgeClass(type: string | undefined): string {
  switch (type) {
    case "string":  return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
    case "integer":
    case "number":  return "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    case "boolean": return "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
    case "object":  return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
    case "array":   return "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400";
    default:        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
  }
}

function schemaTypeLabel(s: Schema): string {
  if (s.type === "array") {
    const itemType = (s.items as Schema | undefined)?.type ?? "object";
    return `array[${itemType}]`;
  }
  if (s.allOf) return "allOf";
  if (s.oneOf) return "oneOf";
  if (s.anyOf) return "anyOf";
  const base = s.type ?? "object";
  return s.format ? `${base}<${s.format}>` : base;
}

/** Renders one schema field row: type badge, nullability, constraints, description, and recursive children. */
export default function SchemaNode({ name, schema, components, depth = 0, required = false }: Props) {
  const resolved  = resolveSchema(schema, components);
  if (depth > 5 || !resolved) return null;

  const typeLabel  = schemaTypeLabel(resolved);
  const badgeClass = typeBadgeClass(resolved.type);
  const combined   = resolved.allOf ?? resolved.oneOf ?? resolved.anyOf ?? null;
  const constraints = [
    resolved.minimum   !== undefined ? `min:${resolved.minimum}`      : "",
    resolved.maximum   !== undefined ? `max:${resolved.maximum}`      : "",
    resolved.minLength !== undefined ? `minLen:${resolved.minLength}` : "",
    resolved.maxLength !== undefined ? `maxLen:${resolved.maxLength}` : "",
  ].filter(Boolean);

  return (
    <div className="py-0.5">
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="font-mono text-[11px] text-gray-800 dark:text-gray-200">{name}</span>
        {required && <span className="text-red-400 text-[9px] font-semibold">*</span>}
        <span className={`text-[10px] rounded px-1.5 py-0.5 font-mono ${badgeClass}`}>{typeLabel}</span>
        {resolved.nullable && (
          <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded px-1 font-mono">nullable</span>
        )}
        {constraints.map(c => (
          <span key={c} className="text-[9px] font-mono text-gray-400 dark:text-gray-500">{c}</span>
        ))}
        {resolved.description && (
          <span className="text-[11px] text-gray-400 dark:text-gray-500">{resolved.description}</span>
        )}
        {resolved.enum && (
          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">
            {resolved.enum.slice(0, 4).map(String).join(" | ")}
          </span>
        )}
      </div>

      {combined?.length ? (
        <div className="border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-3 mt-0.5">
          {combined.map((child, i) => (
            <SchemaNode key={i} name={`[${i}]`} schema={child} components={components} depth={depth + 1} />
          ))}
        </div>
      ) : resolved.type === "object" && resolved.properties ? (
        <div className="border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-3 mt-0.5">
          {Object.entries(resolved.properties).map(([key, prop]) => (
            <SchemaNode
              key={key}
              name={key}
              schema={prop}
              components={components}
              depth={depth + 1}
              required={resolved.required?.includes(key) ?? false}
            />
          ))}
        </div>
      ) : resolved.type === "array" && resolved.items ? (
        <div className="border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-3 mt-0.5">
          <SchemaNode name="[item]" schema={resolved.items} components={components} depth={depth + 1} />
        </div>
      ) : null}
    </div>
  );
}
