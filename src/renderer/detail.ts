import type { EndpointEntry, Parameter, Schema, Components, Response } from "../types/openapi";
import {
  resolveSchema,
  resolveParameter,
  getSuccessResponse,
  getResponseExample,
  schemaToExample,
} from "../parser/spec-parser";
import { methodBadgeClasses, escapeHtml } from "./nav";

// ─── Status code colors ───────────────────────────────────────────────────────

function statusClass(code: string): string {
  const n = parseInt(code);
  if (n >= 200 && n < 300) return "text-green-600 font-mono font-semibold";
  if (n >= 400 && n < 500) return "text-amber-600 font-mono font-semibold";
  if (n >= 500) return "text-red-600 font-mono font-semibold";
  return "text-blue-600 font-mono font-semibold";
}

// ─── Schema tree view ────────────────────────────────────────────────────────

function typeBadgeClass(type: string | undefined): string {
  switch (type) {
    case "string":  return "bg-emerald-50 text-emerald-700";
    case "integer":
    case "number":  return "bg-blue-50 text-blue-700";
    case "boolean": return "bg-purple-50 text-purple-700";
    case "object":  return "bg-amber-50 text-amber-700";
    case "array":   return "bg-cyan-50 text-cyan-700";
    default:        return "bg-gray-100 text-gray-600";
  }
}

function schemaTypeLabel(schema: Schema): string {
  if (schema.type === "array") {
    const itemType = (schema.items as Schema | undefined)?.type ?? "object";
    return `array[${itemType}]`;
  }
  if (schema.allOf) return "allOf";
  if (schema.oneOf) return "oneOf";
  if (schema.anyOf) return "anyOf";
  const base = schema.type ?? "object";
  return schema.format ? `${base}<${schema.format}>` : base;
}

function renderSchemaNode(
  name: string,
  schema: Schema | undefined,
  components: Components | undefined,
  depth: number,
  required: boolean
): string {
  if (depth > 5) return "";
  const resolved = resolveSchema(schema, components);
  if (!resolved) return "";

  const typeLabel = schemaTypeLabel(resolved);
  const badgeClass = typeBadgeClass(resolved.type);
  const combined = resolved.allOf ?? resolved.oneOf ?? resolved.anyOf;

  const enumHtml = resolved.enum
    ? `<span class="text-[9px] text-gray-400 font-mono">${resolved.enum.slice(0, 4).map((v) => escapeHtml(String(v))).join(" | ")}</span>`
    : "";

  let childrenHtml = "";
  if (combined?.length) {
    const inner = combined.map((s, i) => renderSchemaNode(`[${i}]`, s, components, depth + 1, false)).join("");
    childrenHtml = `<div class="border-l-2 border-gray-100 ml-3 pl-3 mt-0.5">${inner}</div>`;
  } else if (resolved.type === "object" && resolved.properties) {
    const inner = Object.entries(resolved.properties)
      .map(([key, prop]) => renderSchemaNode(key, prop, components, depth + 1, resolved.required?.includes(key) ?? false))
      .join("");
    childrenHtml = `<div class="border-l-2 border-gray-100 ml-3 pl-3 mt-0.5">${inner}</div>`;
  } else if (resolved.type === "array" && resolved.items) {
    const inner = renderSchemaNode("[item]", resolved.items, components, depth + 1, false);
    childrenHtml = `<div class="border-l-2 border-gray-100 ml-3 pl-3 mt-0.5">${inner}</div>`;
  }

  return `
    <div class="py-0.5">
      <div class="flex items-baseline gap-1.5 flex-wrap">
        <span class="font-mono text-[11px] text-gray-800">${escapeHtml(name)}</span>
        ${required ? '<span class="text-red-400 text-[9px] font-semibold">required</span>' : ""}
        <span class="text-[10px] rounded px-1.5 py-0.5 font-mono ${badgeClass}">${escapeHtml(typeLabel)}</span>
        ${resolved.nullable ? '<span class="text-[9px] bg-gray-100 text-gray-500 rounded px-1 font-mono">nullable</span>' : ""}
        ${resolved.description ? `<span class="text-[11px] text-gray-400">${escapeHtml(resolved.description)}</span>` : ""}
        ${enumHtml}
      </div>
      ${childrenHtml}
    </div>`;
}

function renderResponseSchemaTree(
  responses: Record<string, Response>,
  components: Components | undefined
): string {
  const successEntry = getSuccessResponse(responses);
  if (!successEntry) return "";
  const [code, response] = successEntry;

  const content = response.content ?? {};
  const jsonMedia = content["application/json"] ?? content["*/*"] ?? Object.values(content)[0];
  if (!jsonMedia?.schema) return "";

  const resolved = resolveSchema(jsonMedia.schema, components);
  if (!resolved) return "";

  const topLabel = schemaTypeLabel(resolved);
  const topBadge = typeBadgeClass(resolved.type);
  const combined = resolved.allOf ?? resolved.oneOf ?? resolved.anyOf;

  let bodyHtml = "";
  if (combined?.length) {
    bodyHtml = combined.map((s, i) => renderSchemaNode(`[${i}]`, s, components, 0, false)).join("");
  } else if (resolved.type === "object" && resolved.properties) {
    bodyHtml = Object.entries(resolved.properties)
      .map(([key, prop]) => renderSchemaNode(key, prop, components, 0, resolved.required?.includes(key) ?? false))
      .join("");
  } else if (resolved.type === "array" && resolved.items) {
    bodyHtml = renderSchemaNode("[item]", resolved.items, components, 0, false);
  } else {
    bodyHtml = `<span class="text-[10px] font-mono text-gray-500">${escapeHtml(topLabel)}</span>`;
  }

  return `
    <div class="mb-6">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
        Response Schema
        <span class="ml-2 text-[10px] normal-case font-normal">
          <span class="rounded px-1.5 py-0.5 font-mono ${topBadge}">${escapeHtml(topLabel)}</span>
          <span class="text-gray-300 ml-1">· ${escapeHtml(code)}</span>
        </span>
      </h3>
      <div class="border border-gray-100 rounded-lg bg-white px-3 py-2">
        ${bodyHtml || '<span class="text-xs text-gray-400 italic">No schema defined</span>'}
      </div>
    </div>`;
}

// ─── Schema renderer ──────────────────────────────────────────────────────────

function renderSchema(schema: Schema | undefined, components: Components | undefined, depth = 0): string {
  const resolved = resolveSchema(schema, components);
  if (!resolved) return '<span class="text-gray-400 text-xs">—</span>';

  if (resolved.enum) {
    return `<span class="text-xs text-gray-500">enum: ${resolved.enum.map((v) => `<code class="bg-gray-100 rounded px-1 text-[10px]">${escapeHtml(String(v))}</code>`).join(" ")}</span>`;
  }

  if (resolved.type === "object" && resolved.properties && depth < 2) {
    const rows = Object.entries(resolved.properties).map(([key, prop]) => {
      const propResolved = resolveSchema(prop, components);
      const required = resolved.required?.includes(key);
      return `
        <tr class="border-b border-gray-100 last:border-0">
          <td class="py-1.5 pr-3 font-mono text-[11px] text-gray-800 whitespace-nowrap">
            ${escapeHtml(key)}${required ? '<span class="text-red-500 ml-0.5">*</span>' : ""}
          </td>
          <td class="py-1.5 pr-3">
            <span class="text-[10px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-mono">${propResolved?.type ?? "any"}</span>
          </td>
          <td class="py-1.5 text-xs text-gray-500">${escapeHtml(propResolved?.description ?? "")}</td>
        </tr>`;
    });
    return `<table class="w-full text-sm"><tbody>${rows.join("")}</tbody></table>`;
  }

  if (resolved.type === "array" && resolved.items) {
    return `<span class="text-xs text-gray-500">array of </span>${renderSchema(resolved.items, components, depth + 1)}`;
  }

  const type = resolved.type ?? (resolved.allOf ? "object" : "any");
  const format = resolved.format ? `<span class="text-gray-400 ml-1">·${resolved.format}</span>` : "";
  return `<span class="text-[10px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-mono">${type}${format}</span>`;
}

// ─── Parameters table ─────────────────────────────────────────────────────────

function renderParameters(params: Parameter[], components: Components | undefined): string {
  if (!params.length) return '<p class="text-xs text-gray-400 italic">No parameters</p>';

  const grouped = {
    path: params.filter((p) => p.in === "path"),
    query: params.filter((p) => p.in === "query"),
    header: params.filter((p) => p.in === "header"),
    cookie: params.filter((p) => p.in === "cookie"),
  };

  return Object.entries(grouped)
    .filter(([, items]) => items.length > 0)
    .map(([location, items]) => `
      <div class="mb-4">
        <h4 class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">${location}</h4>
        <div class="border border-gray-100 rounded-lg overflow-hidden">
          ${items.map((rawParam) => {
            const param = resolveParameter(rawParam, components);
            const schema = resolveSchema(param.schema, components);
            return `
              <div class="flex items-start gap-3 px-3 py-2.5 border-b border-gray-100 last:border-0 bg-white hover:bg-gray-50/50 transition-colors">
                <div class="min-w-[120px]">
                  <span class="font-mono text-[11px] text-gray-800">${escapeHtml(param.name)}</span>
                  ${param.required ? '<span class="text-red-500 text-[9px] ml-1 font-semibold">required</span>' : ""}
                  ${param.deprecated ? '<span class="text-gray-400 text-[9px] ml-1">deprecated</span>' : ""}
                </div>
                <span class="text-[10px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-mono shrink-0">${schema?.type ?? "string"}</span>
                <span class="text-xs text-gray-500 flex-1">${escapeHtml(param.description ?? schema?.description ?? "")}</span>
              </div>`;
          }).join("")}
        </div>
      </div>`)
    .join("");
}

// ─── Request body ─────────────────────────────────────────────────────────────

function renderRequestBody(endpoint: EndpointEntry, components: Components | undefined): string {
  const rb = endpoint.operation.requestBody;
  if (!rb) return "";

  const jsonContent = rb.content?.["application/json"];
  if (!jsonContent) return "";

  const example = jsonContent.example !== undefined
    ? JSON.stringify(jsonContent.example, null, 2)
    : jsonContent.examples
      ? JSON.stringify(Object.values(jsonContent.examples)[0]?.value ?? {}, null, 2)
      : JSON.stringify(schemaToExample(jsonContent.schema, components) ?? {}, null, 2);

  return `
    <div class="mb-6">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Request body</h3>
      ${rb.description ? `<p class="text-xs text-gray-500 mb-2">${escapeHtml(rb.description)}</p>` : ""}
      <div class="border border-gray-100 rounded-lg overflow-hidden">
        <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <span class="text-[10px] text-gray-500 font-mono">application/json</span>
          ${rb.required ? '<span class="text-[9px] text-red-500 font-semibold">required</span>' : ""}
        </div>
        ${jsonContent.schema ? `<div class="p-3">${renderSchema(jsonContent.schema, components)}</div>` : ""}
        <div class="px-3 pb-3">
          <p class="text-[10px] text-gray-400 mb-1 mt-1">Example</p>
          <pre class="text-[11px] bg-gray-50 rounded-md p-3 overflow-x-auto text-gray-700 font-mono leading-relaxed">${escapeHtml(example)}</pre>
        </div>
      </div>
    </div>`;
}

// ─── Responses section ────────────────────────────────────────────────────────

function renderResponses(
  responses: Record<string, Response>,
  components: Components | undefined
): string {
  const entries = Object.entries(responses);
  if (!entries.length) return "";

  return `
    <div class="mb-6">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Responses</h3>
      <div class="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100">
        ${entries.map(([code, response]) => {
          const example = getResponseExample(response, components);
          const hasContent = !!example;
          return `
            <div class="response-item" data-code="${code}">
              <button class="response-toggle w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left">
                <span class="${statusClass(code)} text-xs">${code}</span>
                <span class="text-xs text-gray-600 flex-1">${escapeHtml(response.description)}</span>
                ${hasContent ? `
                  <svg class="response-chevron w-3 h-3 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>` : ""}
              </button>
              ${hasContent ? `
                <div class="response-body hidden px-3 pb-3 pt-1">
                  <pre class="text-[11px] bg-gray-50 rounded-md p-3 overflow-x-auto text-gray-700 font-mono leading-relaxed">${escapeHtml(example)}</pre>
                </div>` : ""}
            </div>`;
        }).join("")}
      </div>
    </div>`;
}

// ─── Main detail pane ─────────────────────────────────────────────────────────

export function renderDetail(endpoint: EndpointEntry, components: Components | undefined): string {
  const op = endpoint.operation;
  const params = (op.parameters ?? []).map((p) => resolveParameter(p, components));
  const successEntry = getSuccessResponse(op.responses ?? {});

  return `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 shrink-0">
        <span class="method-badge shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded ${methodBadgeClasses(endpoint.method)} uppercase w-[36px] text-center">${endpoint.method}</span>
        <code class="font-mono text-sm text-gray-800">${escapeHtml(endpoint.path)}</code>
        ${op.deprecated ? '<span class="ml-auto text-[10px] bg-amber-50 text-amber-600 border border-amber-200 rounded px-2 py-0.5">deprecated</span>' : ""}
      </div>

      <!-- Scrollable body -->
      <div class="flex-1 overflow-y-auto px-5 py-4">
        ${op.summary ? `<p class="text-sm text-gray-700 mb-1 font-medium">${escapeHtml(op.summary)}</p>` : ""}
        ${op.description ? `<p class="text-xs text-gray-500 mb-5 leading-relaxed">${escapeHtml(op.description)}</p>` : '<div class="mb-4"></div>'}

        <!-- Parameters -->
        <div class="mb-6">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Parameters</h3>
          ${renderParameters(params, components)}
        </div>

        <!-- Request body -->
        ${renderRequestBody(endpoint, components)}

        <!-- Responses -->
        ${renderResponses(op.responses ?? {}, components)}

        <!-- Response schema tree -->
        ${renderResponseSchemaTree(op.responses ?? {}, components)}

        <!-- Operation metadata -->
        <div class="mt-2 pt-4 border-t border-gray-100">
          ${op.operationId ? `<p class="text-[10px] text-gray-400">operationId: <code class="font-mono">${escapeHtml(op.operationId)}</code></p>` : ""}
          ${successEntry ? `<p class="text-[10px] text-gray-400 mt-1">primary response: <span class="${statusClass(successEntry[0])} text-[10px]">${successEntry[0]}</span></p>` : ""}
        </div>
      </div>
    </div>`;
}

export function renderSchemaDetail(name: string, schema: Schema, components: Components | undefined): string {
  const resolved = resolveSchema(schema, components);
  if (!resolved) return renderDetailEmpty();

  const typeLabel = schemaTypeLabel(resolved);
  const badgeClass = typeBadgeClass(resolved.type ?? "object");
  const combined = resolved.allOf ?? resolved.oneOf ?? resolved.anyOf;

  let bodyHtml = "";
  if (combined?.length) {
    bodyHtml = combined.map((s, i) => renderSchemaNode(`[${i}]`, s, components, 0, false)).join("");
  } else if (resolved.type === "object" && resolved.properties) {
    bodyHtml = Object.entries(resolved.properties)
      .map(([key, prop]) => renderSchemaNode(key, prop, components, 0, resolved.required?.includes(key) ?? false))
      .join("");
  } else if (resolved.type === "array" && resolved.items) {
    bodyHtml = renderSchemaNode("[item]", resolved.items, components, 0, false);
  }

  const example = schemaToExample(schema, components);
  const exampleJson = example !== undefined ? JSON.stringify(example, null, 2) : null;

  return `
    <div class="h-full flex flex-col">
      <div class="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 shrink-0">
        <span class="text-[9px] font-bold font-mono px-[5px] py-[2px] rounded ${badgeClass} uppercase">${escapeHtml(typeLabel)}</span>
        <code class="font-mono text-sm text-gray-800">${escapeHtml(name)}</code>
      </div>
      <div class="flex-1 overflow-y-auto px-5 py-4">
        ${resolved.description ? `<p class="text-sm text-gray-500 mb-5 leading-relaxed">${escapeHtml(resolved.description)}</p>` : ""}
        ${bodyHtml ? `
          <div class="mb-6">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Properties</h3>
            <div class="border border-gray-100 rounded-lg bg-white px-3 py-2">${bodyHtml}</div>
          </div>` : ""}
        ${exampleJson ? `
          <div class="mb-6">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Example</h3>
            <pre class="text-[11px] bg-gray-50 rounded-md p-3 overflow-x-auto text-gray-700 font-mono leading-relaxed border border-gray-100">${escapeHtml(exampleJson)}</pre>
          </div>` : ""}
      </div>
    </div>`;
}

export function renderDetailEmpty(): string {
  return `
    <div class="h-full flex flex-col items-center justify-center text-center px-8 gap-3">
      <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <p class="text-sm text-gray-400">Select an endpoint to view documentation</p>
    </div>`;
}
