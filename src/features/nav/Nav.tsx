/** Sidebar navigation: unified endpoint + schema list with a single search input. */
import {useMemo, useState} from "react";
import clsx from "clsx";
import {useNav} from "./nav-context";
import {useSpec} from "../spec/spec-context";
import {selectEndpoint, selectSchema} from "../../shared/state/actions";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface NavTheme {
  container: ThemeSlot;
  divider: ThemeSlot;
  searchWrapper: ThemeSlot;
  searchInput: ThemeSlot;
  searchIcon: ThemeSlot;
  searchClearButton: ThemeSlot;
  searchHint: ThemeSlot;
  loadingSpinner: ThemeSlot;
  tabBar: ThemeSlot;
  tab: ThemeSlot; // variants: active
  tagHeader: ThemeSlot;
  tagChevron: ThemeSlot;
  tagCount: ThemeSlot;
  endpointItem: ThemeSlot; // variants: active
  endpointPath: ThemeSlot;
  methodBadge: ThemeSlot; // variants: get, post, put, patch, delete, head, options
  schemaItem: ThemeSlot; // variants: active
  schemaName: ThemeSlot; // variants: active
  schemaTypeBadge: ThemeSlot;
  schemaDescription: ThemeSlot;
  emptyState: ThemeSlot;
}

/** Renders the sidebar with a single search input and a scrollable endpoint + schema list. */
export default function Nav() {
  const {searchQuery, activeEndpoint, activeSchema, setSearchQuery} = useNav();
  const {spec, groups, specLoading} = useSpec();
  const t = useTheme().nav;

  const [collapsedTags, setCollapsedTags] = useState(new Set<string>());
  const [schemasCollapsed, setSchemasCollapsed] = useState(false);

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

  const hasSchemas = Object.keys(schemas).length > 0;

  return (
      <aside className={slot(t.container)}>

        <div className={slot(t.searchWrapper)}>
          <div className="relative">
            <svg className={slot(t.searchIcon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
                id="search-input"
                type="text"
                autoComplete="off"
                placeholder="Filter…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={slot(t.searchInput)}
            />
            {searchQuery ? (
                <button onClick={() => setSearchQuery("")} className={slot(t.searchClearButton)}>×</button>
            ) : (
                <kbd className={slot(t.searchHint)}>/</kbd>
            )}
          </div>
        </div>

        {specLoading && !spec ? (
            <div className="flex items-center justify-center flex-1 py-8">
              <svg className={slot(t.loadingSpinner)} xmlns="http://www.w3.org/2000/svg" fill="none"
                   viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
        ) : (
            <div className="overflow-y-auto flex-1">

              {/* Endpoints */}
              {filteredGroups.length === 0 && searchQuery ? null : (
                  filteredGroups.map(group => {
                    const collapsed = collapsedTags.has(group.name);
                    return (
                        <div key={group.name}>
                          <button
                              className={slot(t.tagHeader)}
                              aria-expanded={!collapsed}
                              onClick={() => toggleTag(group.name)}
                          >
                            <span>{group.name}</span>
                            <svg
                                className={clsx(slot(t.tagChevron), collapsed && "-rotate-90")}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 9l-7 7-7-7"/>
                            </svg>
                          </button>

                          {!collapsed && (
                              <div>
                                {group.endpoints.map(ep => {
                                  const isActive = activeEndpoint?.path === ep.path && activeEndpoint?.method === ep.method;
                                  return (
                                      <button
                                          key={`${ep.method}:${ep.path}`}
                                          className={slot(t.endpointItem, {active: isActive})}
                                          title={ep.operation.summary ?? ep.path}
                                          onClick={() => selectEndpoint(ep)}
                                      >
                            <span className={slot(t.methodBadge, {[ep.method.toLowerCase()]: true})}>
                              {ep.method}
                            </span>
                                        <span className={slot(t.endpointPath)}>{ep.path}</span>
                                      </button>
                                  );
                                })}
                              </div>
                          )}
                        </div>
                    );
                  })
              )}

              {/* Schemas section */}
              {hasSchemas && filteredSchemaNames.length > 0 && (
                  <>
                    <button
                        className={clsx(slot(t.divider), slot(t.tagHeader))}
                        aria-expanded={!schemasCollapsed}
                        onClick={() => setSchemasCollapsed(c => !c)}
                    >
                      <span>Schemas</span>
                      <svg
                          className={clsx(slot(t.tagChevron), schemasCollapsed && "-rotate-90")}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    {!schemasCollapsed && filteredSchemaNames.map(name => {
                      const schema = schemas[name];
                      const typeLabel = schema.type ?? (schema.properties ? "object" : schema.items ? "array" : "");
                      const isActive = name === activeSchema;
                      return (
                          <button
                              key={name}
                              className={slot(t.schemaItem, {active: isActive})}
                              onClick={() => selectSchema(name)}
                          >
                            <div className="flex items-center gap-2">
                      <span className={slot(t.schemaTypeBadge)}>
                        {typeLabel || "obj"}
                      </span>
                              <span className={slot(t.schemaName, {active: isActive})}>
                        {name}
                      </span>
                            </div>
                            {schema.description && (
                                <p className={slot(t.schemaDescription)}>{schema.description}</p>
                            )}
                          </button>
                      );
                    })}
                  </>
              )}

              {/* Empty state when search matches nothing at all */}
              {filteredGroups.length === 0 && filteredSchemaNames.length === 0 && searchQuery && (
                  <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                    <p className={slot(t.emptyState)}>No results match</p>
                  </div>
              )}

            </div>
        )}

      </aside>
  );
}