/** Sidebar navigation: endpoint list, schema list, search, and tab switching. */
import { useState, useMemo } from "react";
import clsx from "clsx";
import { useNav } from "./nav-context";
import { useSpec } from "../spec/spec-context";
import { selectEndpoint, selectSchema } from "../../shared/state/actions";
import { methodBadgeClasses } from "../../shared/utils/badges";

/** Renders the sidebar with tabs, search, and a scrollable endpoint/schema list. */
export default function Nav() {
  const { searchQuery, sidebarTab, activeEndpoint, activeSchema, setSearchQuery, setSidebarTab } = useNav();
  const { spec, groups } = useSpec();

  const [collapsedTags, setCollapsedTags] = useState(new Set<string>());

  function toggleTag(name: string) {
    setCollapsedTags(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map(g => ({
        ...g,
        endpoints: g.endpoints.filter(ep =>
          ep.path.toLowerCase().includes(q) ||
          ep.method.toLowerCase().includes(q) ||
          ep.operation.summary?.toLowerCase().includes(q) ||
          ep.operation.operationId?.toLowerCase().includes(q)
        ),
      }))
      .filter(g => g.endpoints.length > 0);
  }, [searchQuery, groups]);

  const schemas = spec?.components?.schemas ?? {};

  const filteredSchemaNames = useMemo(() => {
    const allNames = Object.keys(schemas);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allNames;
    return allNames.filter(name =>
      name.toLowerCase().includes(q) ||
      schemas[name].description?.toLowerCase().includes(q)
    );
  }, [searchQuery, schemas]);

  const tabClass = (id: "endpoints" | "schemas") =>
    id === sidebarTab
      ? "flex-1 py-3 text-[11px] font-medium transition-colors border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
      : "flex-1 py-3 text-[11px] font-medium transition-colors border-b-2 border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300";

  return (
    <aside className="shrink-0 bg-gray-50 dark:bg-gray-800 overflow-y-auto flex flex-col h-full">

      <div className="flex border-b border-gray-100 dark:border-gray-700 shrink-0">
        <button className={tabClass("endpoints")} onClick={() => setSidebarTab("endpoints")}>Endpoints</button>
        <button className={tabClass("schemas")}   onClick={() => setSidebarTab("schemas")}>Schemas</button>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            id="search-input"
            type="text"
            autoComplete="off"
            placeholder={sidebarTab === "schemas" ? "Filter schemas…" : "Filter endpoints…"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-6 py-2 text-[11px] border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 leading-none text-sm"
            >×</button>
          ) : (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-300 dark:text-gray-600 border border-gray-200 dark:border-gray-600 rounded px-1 font-mono pointer-events-none leading-none">/</kbd>
          )}
        </div>
      </div>

      {sidebarTab === "endpoints" && (
        filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center gap-2">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">No endpoints match</p>
          </div>
        ) : (
          <div>
            {filteredGroups.map(group => {
              const collapsed = collapsedTags.has(group.name);
              return (
                <div key={group.name}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-expanded={!collapsed}
                    onClick={() => toggleTag(group.name)}
                  >
                    <span>{group.name}</span>
                    <svg
                      className={clsx("w-3 h-3 transition-transform", collapsed && "-rotate-90")}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  {!collapsed && (
                    <div>
                      {group.endpoints.map(ep => {
                        const isActive = activeEndpoint?.path === ep.path && activeEndpoint?.method === ep.method;
                        return (
                          <button
                            key={`${ep.method}:${ep.path}`}
                            className={clsx(
                              "nav-endpoint w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors",
                              isActive
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200"
                            )}
                            title={ep.operation.summary ?? ep.path}
                            onClick={() => selectEndpoint(ep)}
                          >
                            <span className={`method-badge shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded ${methodBadgeClasses(ep.method)} uppercase w-[36px] text-center`}>
                              {ep.method}
                            </span>
                            <span className="truncate text-[11px] font-mono">{ep.path}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {sidebarTab === "schemas" && (
        Object.keys(schemas).length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">No schemas defined</p>
          </div>
        ) : filteredSchemaNames.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">No schemas match</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {filteredSchemaNames.map(name => {
              const schema    = schemas[name];
              const typeLabel = schema.type ?? (schema.properties ? "object" : schema.items ? "array" : "");
              const isActive  = name === activeSchema;
              return (
                <button
                  key={name}
                  className={clsx(
                    "w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 transition-colors",
                    isActive ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  )}
                  onClick={() => selectSchema(name)}
                >
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 uppercase">
                      {typeLabel || "obj"}
                    </span>
                    <span className={clsx("truncate text-[11px] font-mono", isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300")}>
                      {name}
                    </span>
                  </div>
                  {schema.description && (
                    <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500 truncate pl-[38px]">{schema.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        )
      )}

    </aside>
  );
}
