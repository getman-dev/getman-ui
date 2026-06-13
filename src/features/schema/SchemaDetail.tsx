/** Schema detail view: type header and full schema tree with example tab. */
import type {Schema} from "../spec/openapi";
import {useNav} from "../nav/nav-context";
import {useSpec} from "../spec/spec-context";
import {resolveSchema} from "../spec/ref-resolver";
import SchemaViewer from "./SchemaViewer";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface SchemaDetailTheme {
  header: ThemeSlot;
  typeBadge: ThemeSlot;
  schemaName: ThemeSlot;
  description: ThemeSlot;
  sectionLabel: ThemeSlot;
  schemaBox: ThemeSlot;
  typeBadgeColors: Record<string, string>;
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

/** Renders schema name, type badge, description, and a SchemaViewer. */
export default function SchemaDetail() {
  const t = useTheme().schemaDetail;
  const {activeSchema} = useNav();
  const {spec} = useSpec();

  const components = spec?.components;
  const rawSchema = activeSchema ? (components?.schemas?.[activeSchema] ?? null) : null;
  const resolved = rawSchema ? resolveSchema(rawSchema, components) : null;
  const typeLabel = resolved ? schemaTypeLabel(resolved) : "";
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
              <SchemaViewer schema={rawSchema} components={components}/>
            </div>
          </div>
        </div>

      </div>
  );
}