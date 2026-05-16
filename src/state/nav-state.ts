/** Owns sidebar navigation: active endpoint/schema, search query, and tab selection. */
import type { EndpointEntry } from "../types/openapi";

function createNavState() {
  let searchQuery = "";
  let sidebarTab: "endpoints" | "schemas" = "endpoints";
  let activeEndpoint: EndpointEntry | null = null;
  let activeSchema: string | null = null;
  const subs = new Set<() => void>();
  const notify = () => subs.forEach(fn => fn());

  return {
    get searchQuery()    { return searchQuery; },
    get sidebarTab()     { return sidebarTab; },
    get activeEndpoint() { return activeEndpoint; },
    get activeSchema()   { return activeSchema; },
    setSearch(q: string)                        { searchQuery = q;  notify(); },
    setSidebarTab(tab: "endpoints" | "schemas") { sidebarTab = tab; notify(); },
    // Sets both active endpoint and schema atomically to avoid double-notifications.
    setActivePage(endpoint: EndpointEntry | null, schema: string | null) {
      activeEndpoint = endpoint;
      activeSchema = schema;
      notify();
    },
    clear() {
      searchQuery = ""; sidebarTab = "endpoints"; activeEndpoint = null; activeSchema = null;
      notify();
    },
    sub(fn: () => void) { subs.add(fn); return () => subs.delete(fn); },
  };
}

export const navState = createNavState();