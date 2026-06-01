/** Tabbed schema visualizer: a "Schema" tree panel and an "Example" JSON panel. */
import { useState } from "react";
import type { Schema, Components } from "../spec/openapi";
import { resolveSchema } from "../spec/ref-resolver";
import { schemaToExample } from "../spec/example-gen";
import { highlightJson } from "../../shared/utils/highlight";
import SchemaNode from "./SchemaNode";

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

const TAB_ACTIVE   = "px-3 py-1 text-[11px] font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600";
const TAB_INACTIVE = "px-3 py-1 text-[11px] font-medium rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors";

/** Renders schema fields and/or an example JSON block with optional tabs between them. */
export default function SchemaViewer({ schema, components, options = {} }: Props) {
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
        className="text-[11px] bg-gray-50 dark:bg-gray-900 rounded-md p-3 overflow-x-auto text-gray-700 dark:text-gray-300 font-mono leading-relaxed"
        dangerouslySetInnerHTML={{ __html: highlightedExample! }}
      />
    );
  }

  const topLevelDescription = resolved?.description ? (
    <p className="px-4 pt-3 pb-0 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
      {resolved.description}
    </p>
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
        <div className="flex gap-1 px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
          <button className={activeTab === "schema" ? TAB_ACTIVE : TAB_INACTIVE} onClick={() => setActiveTab("schema")}>
            Schema
          </button>
          <button className={activeTab === "example" ? TAB_ACTIVE : TAB_INACTIVE} onClick={() => setActiveTab("example")}>
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
              className="text-[11px] bg-gray-50 dark:bg-gray-900 rounded-md p-3 overflow-x-auto text-gray-700 dark:text-gray-300 font-mono leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightedExample! }}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
}
