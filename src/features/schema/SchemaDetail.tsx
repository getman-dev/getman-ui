/** Schema detail view: type header and full schema tree with example tab. */
import type { Schema } from "../spec/openapi";
import { useNav } from "../nav/nav-context";
import { useSpec } from "../spec/spec-context";
import { resolveSchema } from "../spec/ref-resolver";
import SchemaViewer from "./SchemaViewer";
import type { ThemeSlot } from "../../themes/slot";
import { slot } from "../../themes/slot";
import type { ThemeMode } from "../../themes/types";
import { useThemeMode } from "../../shared/contexts/theme-mode-context";

export interface SchemaDetailTheme {
  header:      ThemeSlot;
  typeBadge:   ThemeSlot;
  schemaName:  ThemeSlot;
  description: ThemeSlot;
  sectionLabel:ThemeSlot;
  schemaBox:   ThemeSlot;
  typeBadgeColors: Record<string, string>;
}

export const schemaDetailTheme: Record<ThemeMode, SchemaDetailTheme> = {
  default: {
    header:      'flex items-center gap-3 px-6 py-5 border-b border-gray-100 shrink-0',
    typeBadge:   'text-[9px] font-bold font-mono px-[5px] py-[2px] rounded uppercase',
    schemaName:  'font-mono text-sm text-gray-800',
    description: 'text-sm text-gray-500 mb-6 leading-relaxed',
    sectionLabel:'text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4',
    schemaBox:   'border border-gray-100 rounded-lg overflow-hidden bg-white',
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
    header:      'flex items-center gap-3 px-6 py-5 border-b border-gray-700 shrink-0',
    typeBadge:   'text-[9px] font-bold font-mono px-[5px] py-[2px] rounded uppercase',
    schemaName:  'font-mono text-sm text-gray-200',
    description: 'text-sm text-gray-400 mb-6 leading-relaxed',
    sectionLabel:'text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4',
    schemaBox:   'border border-gray-700 rounded-lg overflow-hidden bg-gray-800/50',
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

/** Renders schema name, type badge, description, and a SchemaViewer. */
export default function SchemaDetail() {
  const t = schemaDetailTheme[useThemeMode()];
  const { activeSchema } = useNav();
  const { spec } = useSpec();

  const components = spec?.components;
  const rawSchema  = activeSchema ? (components?.schemas?.[activeSchema] ?? null) : null;
  const resolved   = rawSchema ? resolveSchema(rawSchema, components) : null;
  const typeLabel  = resolved ? schemaTypeLabel(resolved) : "";
  const badgeColor = t.typeBadgeColors[resolved?.type ?? ''] ?? t.typeBadgeColors['default'];

  if (!activeSchema || !rawSchema || !resolved) return null;

  return (
    <div className="h-full flex flex-col">

      <div className={slot(t.header)}>
        <span className={`${slot(t.typeBadge)} ${badgeColor}`}>{typeLabel}</span>
        <code className={slot(t.schemaName)}>{activeSchema}</code>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {resolved.description && (
          <p className={slot(t.description)}>{resolved.description}</p>
        )}
        <div className="mb-8">
          <h3 className={slot(t.sectionLabel)}>Schema</h3>
          <div className={slot(t.schemaBox)}>
            <SchemaViewer schema={rawSchema} components={components} />
          </div>
        </div>
      </div>

    </div>
  );
}