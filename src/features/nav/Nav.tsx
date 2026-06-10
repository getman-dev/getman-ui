/** Sidebar navigation: unified endpoint + schema list with a single search input. */
import { useState, useMemo } from "react";
import clsx from "clsx";
import { useNav } from "./nav-context";
import { useSpec } from "../spec/spec-context";
import { selectEndpoint, selectSchema } from "../../shared/state/actions";
import { slot, type ThemeSlot } from "../../themes/slot";
import type { ThemeMode } from "../../themes/types";
import { useThemeMode } from "../../shared/contexts/theme-mode-context";

export interface NavTheme {
  container:         ThemeSlot;
  divider:           ThemeSlot;
  searchWrapper:     ThemeSlot;
  searchInput:       ThemeSlot;
  searchIcon:        ThemeSlot;
  searchClearButton: ThemeSlot;
  searchHint:        ThemeSlot;       // the "/" keyboard shortcut hint
  loadingSpinner:    ThemeSlot;
  tabBar:            ThemeSlot;
  tab:               ThemeSlot;       // variants: active
  tagHeader:         ThemeSlot;
  tagChevron:        ThemeSlot;       // rotation handled by clsx; this slot is layout only
  tagCount:          ThemeSlot;
  endpointItem:      ThemeSlot;       // variants: active, deprecated
  endpointPath:      ThemeSlot;
  methodBadge:       ThemeSlot;       // variants: get, post, put, patch, delete, head, options
  schemaItem:        ThemeSlot;       // variants: active
  schemaName:        ThemeSlot;       // variants: active
  schemaTypeBadge:   ThemeSlot;
  schemaDescription: ThemeSlot;
  emptyState:        ThemeSlot;
}

const methodBadgeBase = 'method-badge shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded uppercase w-[36px] text-center';

export const navTheme: Record<ThemeMode, NavTheme> = {
  default: {
    container:         'shrink-0 bg-gray-50 overflow-y-auto flex flex-col h-full',
    divider:           'mt-1 border-t border-gray-100',
    searchWrapper:     'px-4 py-3 border-b border-gray-100 shrink-0',
    searchInput:       'w-full pl-7 pr-6 py-2 text-[11px] border border-gray-200 rounded-md bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors',
    searchIcon:        'absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none',
    searchClearButton: 'absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 leading-none text-sm',
    searchHint:        'absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-300 border border-gray-200 rounded px-1 font-mono pointer-events-none leading-none',
    loadingSpinner:    'w-5 h-5 animate-spin text-blue-400',
    tabBar:            'flex gap-1 px-4 py-2 border-b border-gray-100',
    tab:               { base: 'px-2.5 py-1 text-[11px] font-medium rounded transition-colors text-gray-400 hover:text-gray-600', active: 'bg-white text-gray-700 border border-gray-200 shadow-sm' },
    tagHeader:         'w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors',
    tagChevron:        'w-3 h-3 transition-transform',
    tagCount:          'text-[10px] text-gray-400 font-mono',
    endpointItem:      { base: 'nav-endpoint w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors text-gray-500 hover:bg-gray-50 hover:text-gray-800', active: 'bg-gray-100 text-gray-900' },
    endpointPath:      'truncate text-[11px] font-mono',
    methodBadge:       { base: methodBadgeBase, get: 'bg-blue-50 text-blue-700', post: 'bg-green-50 text-green-700', put: 'bg-amber-50 text-amber-700', delete: 'bg-red-50 text-red-700', patch: 'bg-pink-50 text-pink-700', options: 'bg-gray-100 text-gray-600', head: 'bg-gray-100 text-gray-600' },
    schemaItem:        { base: 'w-full text-left gap-2.5 px-4 py-2 transition-colors hover:bg-gray-50', active: 'bg-gray-100' },
    schemaName:        { base: 'truncate text-[11px] font-mono text-gray-700', active: 'text-gray-900' },
    schemaTypeBadge:   'shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded bg-purple-50 text-purple-700 uppercase',
    schemaDescription: 'mt-0.5 text-[10px] text-gray-400 truncate pl-[38px]',
    emptyState:        'text-[11px] text-gray-400',
  },
  dark: {
    container:         'shrink-0 bg-gray-800 overflow-y-auto flex flex-col h-full',
    divider:           'mt-1 border-t border-gray-700',
    searchWrapper:     'px-4 py-3 border-b border-gray-700 shrink-0',
    searchInput:       'w-full pl-7 pr-6 py-2 text-[11px] border border-gray-600 rounded-md bg-gray-700 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors',
    searchIcon:        'absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none',
    searchClearButton: 'absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 leading-none text-sm',
    searchHint:        'absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-600 border border-gray-600 rounded px-1 font-mono pointer-events-none leading-none',
    loadingSpinner:    'w-5 h-5 animate-spin text-blue-500',
    tabBar:            'flex gap-1 px-4 py-2 border-b border-gray-700',
    tab:               { base: 'px-2.5 py-1 text-[11px] font-medium rounded transition-colors text-gray-500 hover:text-gray-300', active: 'bg-gray-700 text-gray-200 border border-gray-600 shadow-sm' },
    tagHeader:         'w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors',
    tagChevron:        'w-3 h-3 transition-transform',
    tagCount:          'text-[10px] text-gray-500 font-mono',
    endpointItem:      { base: 'nav-endpoint w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors text-gray-400 hover:bg-gray-700/50 hover:text-gray-200', active: 'bg-gray-700 text-gray-100' },
    endpointPath:      'truncate text-[11px] font-mono',
    methodBadge:       { base: methodBadgeBase, get: 'bg-blue-900/30 text-blue-400', post: 'bg-green-900/30 text-green-400', put: 'bg-amber-900/30 text-amber-400', delete: 'bg-red-900/30 text-red-400', patch: 'bg-pink-900/30 text-pink-400', options: 'bg-gray-700 text-gray-400', head: 'bg-gray-700 text-gray-400' },
    schemaItem:        { base: 'w-full text-left gap-2.5 px-4 py-2 transition-colors hover:bg-gray-700/50', active: 'bg-gray-700' },
    schemaName:        { base: 'truncate text-[11px] font-mono text-gray-300', active: 'text-gray-100' },
    schemaTypeBadge:   'shrink-0 text-[9px] font-bold font-mono px-[5px] py-[2px] rounded bg-purple-900/30 text-purple-400 uppercase',
    schemaDescription: 'mt-0.5 text-[10px] text-gray-500 truncate pl-[38px]',
    emptyState:        'text-[11px] text-gray-500',
  },
};

/** Renders the sidebar with a single search input and a scrollable endpoint + schema list. */
export default function Nav() {
  const { searchQuery, activeEndpoint, activeSchema, setSearchQuery } = useNav();
  const { spec, groups, specLoading } = useSpec();
  const t = navTheme[useThemeMode()];

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
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
          <svg className={slot(t.loadingSpinner)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
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
                            className={slot(t.endpointItem, { active: isActive })}
                            title={ep.operation.summary ?? ep.path}
                            onClick={() => selectEndpoint(ep)}
                          >
                            <span className={slot(t.methodBadge, { [ep.method.toLowerCase()]: true })}>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {!schemasCollapsed && filteredSchemaNames.map(name => {
                const schema    = schemas[name];
                const typeLabel = schema.type ?? (schema.properties ? "object" : schema.items ? "array" : "");
                const isActive  = name === activeSchema;
                return (
                  <button
                    key={name}
                    className={slot(t.schemaItem, { active: isActive })}
                    onClick={() => selectSchema(name)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={slot(t.schemaTypeBadge)}>
                        {typeLabel || "obj"}
                      </span>
                      <span className={slot(t.schemaName, { active: isActive })}>
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