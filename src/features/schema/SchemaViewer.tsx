/** Tabbed schema visualizer: a "Schema" tree panel and an "Example" JSON panel. */
import {useState} from "react";
import type {Components, Schema} from "../spec/openapi";
import {resolveSchema} from "../spec/ref-resolver";
import {schemaToExample} from "../spec/example-gen";
import {highlightJson} from "../../shared/utils/highlight";
import SchemaNode from "./SchemaNode";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface SchemaViewerTheme {
  tabBar: ThemeSlot;
  tabActive: ThemeSlot;
  tabInactive: ThemeSlot;
  description: ThemeSlot;
  exampleBlock: ThemeSlot;
}

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
  const t = useTheme().schema;
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