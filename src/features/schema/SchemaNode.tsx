/** Recursive component that renders a single OpenAPI schema property row with type, constraints, and nested children. */
import type { Schema, Components } from "../spec/openapi";
import { resolveSchema } from "../spec/ref-resolver";
import type { ThemeSlot } from "../../themes/slot";
import { slot } from "../../themes/slot";
import type { ThemeMode } from "../../themes/types";
import { useThemeMode } from "../../shared/contexts/theme-mode-context";

export interface SchemaNodeTheme {
  name:          ThemeSlot;
  typeBadge:     ThemeSlot;
  nullableBadge: ThemeSlot;
  constraint:    ThemeSlot;
  enumValue:     ThemeSlot;
  description:   ThemeSlot;
  enumKey:       ThemeSlot;
  enumDesc:      ThemeSlot;
  nestedBorder:  ThemeSlot;
  typeBadgeColors: Record<string, string>;
}

export const schemaNodeTheme: Record<ThemeMode, SchemaNodeTheme> = {
  default: {
    name:          'font-mono text-[11px] text-gray-800',
    typeBadge:     'text-[10px] rounded px-1.5 py-0.5 font-mono',
    nullableBadge: 'text-[9px] bg-gray-100 text-gray-500 rounded px-1 font-mono',
    constraint:    'text-[9px] font-mono text-gray-400',
    enumValue:     'text-[9px] text-gray-400 font-mono',
    description:   'text-[11px] text-gray-500 mt-0.5 leading-relaxed',
    enumKey:       'font-mono text-gray-700',
    enumDesc:      'text-gray-400',
    nestedBorder:  'border-l-2 border-gray-100 ml-3 pl-3 mt-0.5',
    typeBadgeColors: {
      string:  'bg-emerald-50 text-emerald-700',
      integer: 'bg-blue-50 text-blue-700',
      number:  'bg-blue-50 text-blue-700',
      boolean: 'bg-purple-50 text-purple-700',
      object:  'bg-amber-50 text-amber-700',
      array:   'bg-cyan-50 text-cyan-700',
      default: 'bg-gray-100 text-gray-600',
    },
  },
  dark: {
    name:          'font-mono text-[11px] text-gray-200',
    typeBadge:     'text-[10px] rounded px-1.5 py-0.5 font-mono',
    nullableBadge: 'text-[9px] bg-gray-700 text-gray-400 rounded px-1 font-mono',
    constraint:    'text-[9px] font-mono text-gray-500',
    enumValue:     'text-[9px] text-gray-500 font-mono',
    description:   'text-[11px] text-gray-400 mt-0.5 leading-relaxed',
    enumKey:       'font-mono text-gray-300',
    enumDesc:      'text-gray-500',
    nestedBorder:  'border-l-2 border-gray-700 ml-3 pl-3 mt-0.5',
    typeBadgeColors: {
      string:  'bg-emerald-900/30 text-emerald-400',
      integer: 'bg-blue-900/30 text-blue-400',
      number:  'bg-blue-900/30 text-blue-400',
      boolean: 'bg-purple-900/30 text-purple-400',
      object:  'bg-amber-900/30 text-amber-400',
      array:   'bg-cyan-900/30 text-cyan-400',
      default: 'bg-gray-700 text-gray-400',
    },
  },
};

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

interface Props {
  name: string;
  schema: Schema | undefined;
  components: Components | undefined;
  depth?: number;
  required?: boolean;
}

/** Renders one schema field row: type badge, nullability, constraints, description, and recursive children. */
export default function SchemaNode({ name, schema, components, depth = 0, required = false }: Props) {
  const t = schemaNodeTheme[useThemeMode()];

  const resolved  = resolveSchema(schema, components);
  if (depth > 5 || !resolved) return null;

  const typeLabel  = schemaTypeLabel(resolved);
  const badgeColor = t.typeBadgeColors[resolved.type ?? ''] ?? t.typeBadgeColors['default'];
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
        <span className={slot(t.name)}>{name}</span>
        {required && <span className="text-red-400 text-[9px] font-semibold">*</span>}
        <span className={`${slot(t.typeBadge)} ${badgeColor}`}>{typeLabel}</span>
        {resolved.nullable && (
          <span className={slot(t.nullableBadge)}>nullable</span>
        )}
        {constraints.map(c => (
          <span key={c} className={slot(t.constraint)}>{c}</span>
        ))}
        {resolved.enum && (
          <span className={slot(t.enumValue)}>
            {resolved.enum.slice(0, 4).map(String).join(" | ")}
          </span>
        )}
      </div>
      {resolved.description && (
        <p className={slot(t.description)}>{resolved.description}</p>
      )}
      {resolved.enum && resolved["x-enumDescriptions"] && (
        <ul className="mt-1 space-y-0.5">
          {resolved.enum.map((val) => {
            const label = resolved["x-enumDescriptions"]![String(val)];
            return label ? (
              <li key={String(val)} className="flex gap-1.5 text-[10px]">
                <span className={slot(t.enumKey)}>{String(val)}</span>
                <span className={slot(t.enumDesc)}>— {label}</span>
              </li>
            ) : null;
          })}
        </ul>
      )}

      {combined?.length ? (
        <div className={slot(t.nestedBorder)}>
          {combined.map((child, i) => (
            <SchemaNode key={i} name={`[${i}]`} schema={child} components={components} depth={depth + 1} />
          ))}
        </div>
      ) : resolved.type === "object" && resolved.properties ? (
        <div className={slot(t.nestedBorder)}>
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
        <div className={slot(t.nestedBorder)}>
          <SchemaNode name="[item]" schema={resolved.items} components={components} depth={depth + 1} />
        </div>
      ) : null}
    </div>
  );
}