/** Tabbed schema visualizer: a "Schema" tree panel and an "Example" JSON panel. */
import { useState } from "react";
import type { Schema, Components } from "../spec/openapi";
import { resolveSchema } from "../spec/ref-resolver";
import { schemaToExample } from "../spec/example-gen";
import { highlightJson } from "../../shared/utils/highlight";
import SchemaNode from "./SchemaNode";
import type { ThemeSlot } from "../../themes/slot";
import { slot } from "../../themes/slot";
import type { ThemeMode } from "../../themes/types";
import { useThemeMode } from "../../shared/contexts/theme-mode-context";

export interface SchemaViewerTheme {
  tabBar:      ThemeSlot;
  tabActive:   ThemeSlot;
  tabInactive: ThemeSlot;
  description: ThemeSlot;
  exampleBlock:ThemeSlot;
}

export const schemaViewerTheme: Record<ThemeMode, SchemaViewerTheme> = {
  default: {
    tabBar:      'flex gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100',
    tabActive:   'px-3 py-1 text-[11px] font-medium rounded-md bg-white text-gray-700 border border-gray-200',
    tabInactive: 'px-3 py-1 text-[11px] font-medium rounded-md text-gray-400 hover:text-gray-600 transition-colors',
    description: 'px-4 pt-3 pb-0 text-[11px] text-gray-500 leading-relaxed',
    exampleBlock:'text-[11px] bg-gray-50 rounded-md p-3 overflow-x-auto text-gray-700 font-mono leading-relaxed',
  },
  dark: {
    tabBar:      'flex gap-1 px-3 py-2 bg-gray-800/80 border-b border-gray-700',
    tabActive:   'px-3 py-1 text-[11px] font-medium rounded-md bg-gray-700 text-gray-200 border border-gray-600',
    tabInactive: 'px-3 py-1 text-[11px] font-medium rounded-md text-gray-500 hover:text-gray-300 transition-colors',
    description: 'px-4 pt-3 pb-0 text-[11px] text-gray-400 leading-relaxed',
    exampleBlock:'text-[11px] bg-gray-900 rounded-md p-3 overflow-x-auto text-gray-300 font-mono leading-relaxed',
  },
};

export interface SchemaViewerOptions {
  /** Pre-serialized JSON example string. Auto-generated from the schema if omitted or null. */
  example?: string | null;
  /** Whether the schema is required at its usage site. */
  required?: boolean;
}

interface Props {
  schema: Schema;
  components: Components | undefined;
  options?: SchemaViewerOptions;
}

/** Renders schema fields and/or an example JSON block with optional tabs between them. */
export default function SchemaViewer({ schema, components, options = {} }: Props) {
  const t = schemaViewerTheme[useThemeMode()];
  const [activeTab, setActiveTab] = useState<"schema" | "example">("schema");

  const resolved  = resolveSchema(schema, components);
  const combined  = resolved?.allOf ?? resolved?.oneOf ?? resolved?.anyOf ?? null;

  const exampleJson: string | null = (() => {
    if (options.example !== undefined && options.example !== null) return options.example;
    const ex = schemaToExample(schema, components);
    return ex !== null ? JSON.stringify(ex, null, 2) : null;
  })();

  const highlightedExample = exampleJson ? highlightJson(exampleJson) : null;

  function renderSchemaTree() {
    if (combined?.length) {
      return combined.map((child, i) => (
        <SchemaNode key={i} name={`[${i}]`} schema={child} components={components} />
      ));
    }
    if (resolved?.type === "object" && resolved.properties) {
      return Object.entries(resolved.properties).map(([key, prop]) => (
        <SchemaNode
          key={key}
          name={key}
          schema={prop}
          components={components}
          required={resolved.required?.includes(key) ?? false}
        />
      ));
    }
    if (resolved?.type === "array" && resolved.items) {
      return <SchemaNode name="[item]" schema={resolved.items} components={components} />;
    }
    if (resolved) {
      return <SchemaNode name="body" schema={resolved} components={components} required={options.required} />;
    }
    return null;
  }

  if (!resolved && exampleJson) {
    return (
      <pre
        className={slot(t.exampleBlock)}
        dangerouslySetInnerHTML={{ __html: highlightedExample! }}
      />
    );
  }

  const topLevelDescription = resolved?.description ? (
    <p className={slot(t.description)}>{resolved.description}</p>
  ) : null;

  if (resolved && !exampleJson) {
    return (
      <div>
        {topLevelDescription}
        <div className="px-4 py-3">{renderSchemaTree()}</div>
      </div>
    );
  }

  if (resolved && exampleJson) {
    return (
      <div>
        <div className={slot(t.tabBar)}>
          <button className={activeTab === "schema" ? slot(t.tabActive) : slot(t.tabInactive)} onClick={() => setActiveTab("schema")}>
            Schema
          </button>
          <button className={activeTab === "example" ? slot(t.tabActive) : slot(t.tabInactive)} onClick={() => setActiveTab("example")}>
            Example
          </button>
        </div>
        {activeTab === "schema" ? (
          <div>
            {topLevelDescription}
            <div className="px-4 py-3">{renderSchemaTree()}</div>
          </div>
        ) : (
          <div className="px-4 py-3">
            <pre
              className={slot(t.exampleBlock)}
              dangerouslySetInnerHTML={{ __html: highlightedExample! }}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
}