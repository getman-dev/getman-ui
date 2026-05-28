// ─── OpenAPI 3.x Type Definitions ────────────────────────────────────────────

export interface OpenAPISpec {
  openapi: string;
  info: Info;
  servers?: Server[];
  paths: Record<string, PathItem>;
  components?: Components;
  tags?: Tag[];
  security?: SecurityRequirement[];
}

export interface Info {
  title: string;
  version: string;
  description?: string;
  contact?: { name?: string; url?: string; email?: string };
  license?: { name: string; url?: string };
}

export interface ServerVariable {
  default: string;
  enum?: string[];
  description?: string;
}

export interface Server {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariable>;
}

export interface Tag {
  name: string;
  description?: string;
}

export interface PathItem {
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  options?: Operation;
  head?: Operation;
}

export interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  security?: SecurityRequirement[];
  deprecated?: boolean;
}

export interface Parameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  style?: string;
  explode?: boolean;
  schema?: Schema;
  example?: unknown;
}

export interface RequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, MediaType>;
}

export interface MediaType {
  schema?: Schema;
  example?: unknown;
  examples?: Record<string, Example>;
}

export interface Example {
  summary?: string;
  value?: unknown;
}

export interface Response {
  description: string;
  content?: Record<string, MediaType>;
  headers?: Record<string, Header>;
}

export interface Header {
  description?: string;
  schema?: Schema;
}

export interface Schema {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  enum?: unknown[];
  example?: unknown;
  $ref?: string;
  allOf?: Schema[];
  oneOf?: Schema[];
  anyOf?: Schema[];
  nullable?: boolean;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface Components {
  schemas?: Record<string, Schema>;
  responses?: Record<string, Response>;
  parameters?: Record<string, Parameter>;
  requestBodies?: Record<string, RequestBody>;
  securitySchemes?: Record<string, SecurityScheme>;
}

export interface OAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface OAuthFlows {
  implicit?: OAuthFlow;
  password?: OAuthFlow;
  clientCredentials?: OAuthFlow;
  authorizationCode?: OAuthFlow;
}

export interface SecurityScheme {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect";
  description?: string;
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlows;
  openIdConnectUrl?: string;
}

export type SecurityRequirement = Record<string, string[]>;

export interface AuthSchemeValue {
  value: string;
  username: string;
  password: string;
}

export type AuthValues = Record<string, AuthSchemeValue>;

// ─── Internal App Types ───────────────────────────────────────────────────────

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

export interface EndpointEntry {
  method: HttpMethod;
  path: string;
  operation: Operation;
  tag: string;
}

export interface TagGroup {
  name: string;
  description?: string;
  endpoints: EndpointEntry[];
}

export interface PlaygroundState {
  endpoint: EndpointEntry | null;
  paramValues: Record<string, string>;
  bodyValue: string;
  bodyParams: Record<string, string>;
  fileValues: Record<string, File | File[]>;
  response: PlaygroundResponse | null;
  loading: boolean;
}

export interface PlaygroundResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  duration: number;
}
