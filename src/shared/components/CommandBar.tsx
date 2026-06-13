/** Command bar overlay (⌘K): search across endpoints, schemas, and actions. */
import {useEffect, useMemo, useRef, useState} from "react";
import {authActions, modalActions, useModal, useSpec} from "../contexts";
import {selectEndpoint, selectSchema} from "../state/actions";
import {methodBadgeClasses} from "../utils/badges";
import {escapeHtml} from "../utils/html";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface CommandBarTheme {
  backdrop: ThemeSlot;
  container: ThemeSlot;
  searchRow: ThemeSlot;
  searchIcon: ThemeSlot;
  input: ThemeSlot;
  clearButton: ThemeSlot;
  groupTitle: ThemeSlot;
  resultItem: ThemeSlot; // variants: active
  actionIcon: ThemeSlot; // variants: active
  resultLabel: ThemeSlot;
  resultSubtitle: ThemeSlot;
  activeChevron: ThemeSlot;
  emptyIcon: ThemeSlot;
  emptyText: ThemeSlot;
  footer: ThemeSlot;
  shortcutText: ThemeSlot;
  shortcutBadge: ThemeSlot;
  specTitle: ThemeSlot;
  highlightMark: string;
}

interface Props {
  onSetTheme: (name: string) => void;
}

interface CommandItem {
  id: string;
  kind: "action" | "endpoint" | "schema";
  label: string;
  subtitle?: string;
  method?: string;
  iconPath: string;
  action: () => void;
}

interface CommandGroup {
  title: string;
  items: CommandItem[];
  offset: number;
}

const I_UPLOAD = "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5";
const I_LOCK = "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z";
const I_SUN = "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z";
const I_MOON = "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z";
const I_SNOWFLAKE = "M12 3v18M3 12h18M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364";
const I_KEYBOARD = "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z";
const I_CUBE = "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9";
const I_GLOBE = "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418";

/** Returns HTML with the matched substring wrapped in a highlight mark. */
function hl(text: string, q: string, markClass: string): string {
  if (!q) return escapeHtml(text);
  const lo = text.toLowerCase();
  const i = lo.indexOf(q);
  if (i === -1) return escapeHtml(text);
  return (
      escapeHtml(text.slice(0, i)) +
      `<mark class="${markClass}">` +
      escapeHtml(text.slice(i, i + q.length)) +
      `</mark>` +
      escapeHtml(text.slice(i + q.length))
  );
}

/** Renders the ⌘K command palette overlay. Visible when commandBarVisible is true. */
export default function CommandBar({onSetTheme}: Props) {
  const t = useTheme().commandBar;
  const {commandBarVisible} = useModal();
  const {spec, groups: specGroups} = useSpec();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input and reset when bar opens.
  useEffect(() => {
    if (commandBarVisible) {
      setQuery("");
      setActiveIndex(0);
      inputRef.current?.focus();
    }
  }, [commandBarVisible]);

  const q = query.toLowerCase().trim();

  function close() {
    modalActions.setCommandBarVisible(false);
  }

  const actionItems = useMemo<CommandItem[]>(() => [
    {
      id: "load-spec", kind: "action",
      label: "Load Spec", subtitle: "Open a spec from URL or file",
      iconPath: I_UPLOAD,
      action: () => {
        close();
        modalActions.setModalVisible(true);
      },
    },
    {
      id: "configure-auth", kind: "action",
      label: "Configure Auth", subtitle: "Set API keys and credentials",
      iconPath: I_LOCK,
      action: () => {
        close();
        authActions.setAuthModalVisible(true);
      },
    },
    {
      id: "theme-light", kind: "action",
      label: "Light Theme", subtitle: "Switch to light theme",
      iconPath: I_SUN,
      action: () => {
        close();
        onSetTheme("light");
      },
    },
    {
      id: "theme-dark", kind: "action",
      label: "Dark Theme", subtitle: "Switch to dark theme",
      iconPath: I_MOON,
      action: () => {
        close();
        onSetTheme("dark");
      },
    },
    {
      id: "theme-nord", kind: "action",
      label: "Nord Theme", subtitle: "Arctic, blue-grey color palette",
      iconPath: I_SNOWFLAKE,
      action: () => {
        close();
        onSetTheme("nord");
      },
    },
    {
      id: "shortcuts", kind: "action",
      label: "Keyboard Shortcuts", subtitle: "View all available shortcuts",
      iconPath: I_KEYBOARD,
      action: () => {
        close();
        modalActions.setShortcutsVisible(true);
      },
    },
    // onSetTheme identity is stable (defined in AppInner, stable reference)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [onSetTheme]);

  const allEndpoints = useMemo(() => specGroups.flatMap(g => g.endpoints), [specGroups]);
  const allSchemaNames = useMemo(() => Object.keys(spec?.components?.schemas ?? {}), [spec]);

  const groups = useMemo<CommandGroup[]>(() => {
    const filteredActions = q
        ? actionItems.filter(a => a.label.toLowerCase().includes(q) || (a.subtitle?.toLowerCase().includes(q) ?? false))
        : actionItems;

    const filteredEndpoints: CommandItem[] = allEndpoints
        .filter(ep =>
            !q ||
            ep.path.toLowerCase().includes(q) ||
            ep.method.includes(q) ||
            (ep.operation.summary?.toLowerCase().includes(q) ?? false) ||
            (ep.operation.operationId?.toLowerCase().includes(q) ?? false) ||
            ep.tag.toLowerCase().includes(q)
        )
        .slice(0, q ? 20 : 7)
        .map(ep => ({
          id: `ep:${ep.method}:${ep.path}`,
          kind: "endpoint" as const,
          label: ep.operation.summary || ep.path,
          subtitle: ep.path,
          method: ep.method,
          iconPath: I_GLOBE,
          action: () => {
            close();
            selectEndpoint(ep);
          },
        }));

    const filteredSchemas: CommandItem[] = allSchemaNames
        .filter(name => !q || name.toLowerCase().includes(q))
        .slice(0, q ? 20 : 6)
        .map(name => ({
          id: `schema:${name}`,
          kind: "schema" as const,
          label: name,
          iconPath: I_CUBE,
          action: () => {
            close();
            selectSchema(name);
          },
        }));

    const raw: { title: string; items: CommandItem[] }[] = [];
    if (filteredActions.length) raw.push({title: "Actions", items: filteredActions});
    if (filteredEndpoints.length) raw.push({title: "Endpoints", items: filteredEndpoints});
    if (filteredSchemas.length) raw.push({title: "Schemas", items: filteredSchemas});

    let offset = 0;
    return raw.map(g => {
      const r: CommandGroup = {...g, offset};
      offset += g.items.length;
      return r;
    });
  }, [q, actionItems, allEndpoints, allSchemaNames]);

  const flatItems = useMemo(() => groups.flatMap(g => g.items), [groups]);

  // Clamp index when filtered results shrink.
  useEffect(() => {
    if (flatItems.length > 0 && activeIndex >= flatItems.length) {
      setActiveIndex(flatItems.length - 1);
    }
  }, [flatItems.length, activeIndex]);

  function scrollActive(idx: number) {
    requestAnimationFrame(() => {
      listRef.current?.querySelector<HTMLElement>(`[data-idx="${idx}"]`)?.scrollIntoView({block: "nearest"});
    });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flatItems.length) {
        const next = (activeIndex + 1) % flatItems.length;
        setActiveIndex(next);
        scrollActive(next);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flatItems.length) {
        const next = (activeIndex - 1 + flatItems.length) % flatItems.length;
        setActiveIndex(next);
        scrollActive(next);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      flatItems[activeIndex]?.action();
    } else if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
  }

  if (!commandBarVisible) return null;

  return (
      <div
          className={slot(t.backdrop)}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
      >
        <div className={slot(t.container)}>

          <div className={slot(t.searchRow)}>
            <svg className={slot(t.searchIcon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
            <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDown}
                type="text"
                autoComplete="off"
                placeholder="Search endpoints, schemas, actions…"
                className={slot(t.input)}
            />
            {query && (
                <button
                    onClick={() => {
                      setQuery("");
                      setActiveIndex(0);
                      inputRef.current?.focus();
                    }}
                    className={slot(t.clearButton)}
                >×</button>
            )}
          </div>

          <div ref={listRef} className="overflow-y-auto flex-1 py-2">
            {flatItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg className={slot(t.emptyIcon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                  <p className={slot(t.emptyText)}>No results for "{query}"</p>
                </div>
            ) : groups.map(group => (
                <div key={group.title}>
                  <div className={slot(t.groupTitle)}>
                    {group.title}
                  </div>
                  {group.items.map((item, j) => {
                    const idx = group.offset + j;
                    const isActive = activeIndex === idx;
                    return (
                        <button
                            key={item.id}
                            data-idx={idx}
                            onClick={item.action}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={slot(t.resultItem, {active: isActive})}
                        >
                          {item.kind === "endpoint" && item.method ? (
                              <span
                                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0 w-14 text-center ${methodBadgeClasses(item.method)}`}>
                        {item.method}
                      </span>
                          ) : (
                              <span className={slot(t.actionIcon, {active: isActive})}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.iconPath}/>
                        </svg>
                      </span>
                          )}

                          <div className="flex-1 min-w-0">
                            <div
                                className={slot(t.resultLabel)}
                                dangerouslySetInnerHTML={{__html: hl(item.label, q, t.highlightMark)}}
                            />
                            {item.subtitle && (
                                <div
                                    className={slot(t.resultSubtitle)}
                                    dangerouslySetInnerHTML={{__html: hl(item.subtitle, q, t.highlightMark)}}
                                />
                            )}
                          </div>

                          {isActive && (
                              <svg className={slot(t.activeChevron)} fill="none" stroke="currentColor"
                                   viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 5l7 7-7 7"/>
                              </svg>
                          )}
                        </button>
                    );
                  })}
                </div>
            ))}
          </div>

          <div className={slot(t.footer)}>
          <span className={slot(t.shortcutText)}>
            <kbd className={slot(t.shortcutBadge)}>↑↓</kbd>
            navigate
          </span>
            <span className={slot(t.shortcutText)}>
            <kbd className={slot(t.shortcutBadge)}>↵</kbd>
            select
          </span>
            <span className={slot(t.shortcutText)}>
            <kbd className={slot(t.shortcutBadge)}>Esc</kbd>
            close
          </span>
            {spec && (
                <span className={slot(t.specTitle)}>
              {spec.info.title}
            </span>
            )}
          </div>

        </div>
      </div>
  );
}