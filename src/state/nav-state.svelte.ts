/** Owns sidebar navigation: active endpoint/schema, search query, and tab selection. */
import type { EndpointEntry } from "../types/openapi";

export const navState = $state({
  searchQuery: "",
  sidebarTab: "endpoints" as "endpoints" | "schemas",
  activeEndpoint: null as EndpointEntry | null,
  activeSchema: null as string | null,
});
