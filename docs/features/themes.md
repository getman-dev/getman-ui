# Feature Spec: Component Slot Theming

## Goal

Allow the API Explorer to be visually customised with any of 10+ built-in themes, and allow embedders to supply their own theme or override individual slots. Theme switching must be instant, type-safe, and require no changes to component logic — only to the theme data.

## Background

The current implementation has a single boolean `darkMode` state in `AppInner`. Dark mode is applied by adding a `.dark` class to the root div; ~296 `dark:` Tailwind variants are scattered across component files. There is no abstraction between a component and its visual appearance, so changing or extending themes requires editing every component file.

## Constraints

- No Shadow DOM — this is an embedded widget; styles must not leak.
- `mountApiExplorer(target, options)` remains the primary integration surface.
- Must keep working with the existing Tailwind v4 setup — no new CSS tooling.
- TypeScript strict mode is on; the theme contract must be fully type-safe.
- Bundle size impact from theme data should be negligible.

---

## Approach: Component Slot Theming

### Core idea

Each component has a **theme interface** that names every styled element in that component as a *slot*. A slot is either a plain Tailwind class string (for elements that are always styled the same way) or a `{ base, ...variants }` object (for elements that change appearance based on runtime conditions). A `slot()` utility resolves a slot value to a final class string given a set of boolean conditions.

Each component **owns its theme interface** — the interface is defined at the top of the component file that uses it. `AppTheme` in `src/themes/contract.ts` imports and composes them all. A React context provides the active theme to every component. The active theme is set at mount time or switched at runtime.

### Why co-locate theme interfaces with components

Placing each `XxxTheme` interface at the top of its component file means:
- The slot vocabulary is visible next to the JSX that uses it — no file switching to understand what a slot does.
- Adding or renaming a slot is a single-file change: interface + usage stay together.
- `contract.ts` becomes a thin composition file that just imports and assembles — it never needs to know slot semantics.

### Why this over CSS custom properties

| Concern | CSS vars | Slot theming |
| --- | --- | --- |
| TypeScript safety on token names | ❌ silent typos | ✅ compile-time error |
| Tailwind autocomplete in theme files | ❌ | ✅ full IntelliSense |
| Per-element conditional styling | ❌ needs extra classes | ✅ built into slot API |
| Adding a new theme | One CSS block | One `.ts` file |
| Consumer override granularity | Token level | Any individual element |
| Readable class strings in components | `bg-[var(--x)]` | `{t.container}` |

---

## Data model

### `ThemeSlot`

```ts
// src/themes/slot.ts

/**
 * A theme slot is either a plain Tailwind class string, or an object with a
 * required `base` key and optional named variant keys. Variant values are
 * appended to `base` when the matching condition is true.
 */
export type ThemeSlot = string | ({ base: string } & Record<string, string>);
```

### `slot()` utility

```ts
/**
 * Resolves a ThemeSlot to a final class string.
 * Plain strings are returned as-is. For objects, `base` is always included;
 * any key present in `conditions` whose value is `true` is also appended.
 * Condition keys not present in the slot definition are silently ignored.
 */
export function slot(def: ThemeSlot, conditions?: Record<string, boolean>): string {
  if (typeof def === 'string') return def;
  const parts = [def.base];
  if (conditions) {
    for (const [key, active] of Object.entries(conditions)) {
      if (active && def[key]) parts.push(def[key]);
    }
  }
  return parts.filter(Boolean).join(' ');
}
```

---

## Component theme interfaces

Each interface is defined at the **top of its component file**, before the component function. Every property is a `ThemeSlot`. The interface defines the vocabulary of conditions a component will ever pass to `slot()`.

### `NavTheme` — top of `src/features/nav/Nav.tsx`

```ts
import type { ThemeSlot } from '~/themes/slot';

export interface NavTheme {
  // layout
  container:            ThemeSlot; // outer sidebar wrapper
  divider:              ThemeSlot; // horizontal separator lines

  // search
  searchWrapper:        ThemeSlot;
  searchInput:          ThemeSlot; // variants: focused, hasValue
  searchIcon:           ThemeSlot;
  searchClearButton:    ThemeSlot;

  // tabs (Endpoints / Schemas)
  tabBar:               ThemeSlot;
  tab:                  ThemeSlot; // variants: active

  // tag group (collapsible section)
  tagHeader:            ThemeSlot;
  tagChevron:           ThemeSlot; // variants: open
  tagCount:             ThemeSlot;

  // endpoint item
  endpointItem:         ThemeSlot; // variants: active, deprecated
  endpointPath:         ThemeSlot;
  methodBadge:          ThemeSlot; // variants: get, post, put, patch, delete, head, options

  // schema item
  schemaItem:           ThemeSlot; // variants: active
  schemaName:           ThemeSlot;
  schemaTypeBadge:      ThemeSlot;

  // empty state
  emptyState:           ThemeSlot;
}
```

### `EndpointTheme` — top of `src/features/endpoint/EndpointDetail.tsx`

```ts
import type { ThemeSlot } from '~/themes/slot';

export interface EndpointTheme {
  container:            ThemeSlot;
  header:               ThemeSlot;
  methodBadge:          ThemeSlot; // variants: get, post, put, patch, delete, head, options
  path:                 ThemeSlot;
  summary:              ThemeSlot;
  description:          ThemeSlot;
  deprecated:           ThemeSlot; // deprecation banner

  // parameters
  paramSection:         ThemeSlot;
  paramSectionTitle:    ThemeSlot;
  paramRow:             ThemeSlot; // variants: required
  paramName:            ThemeSlot;
  paramType:            ThemeSlot;
  paramRequired:        ThemeSlot;
  paramDescription:     ThemeSlot;

  // response accordion
  responseAccordion:    ThemeSlot;
  responseHeader:       ThemeSlot; // variants: open
  responseStatusCode:   ThemeSlot; // variants: success, redirect, clientError, serverError
  responseDescription:  ThemeSlot;

  // request body
  bodySection:          ThemeSlot;
  bodyContentType:      ThemeSlot;
}
```

### `PlaygroundTheme` — top of `src/features/playground/Playground.tsx`

```ts
import type { ThemeSlot } from '~/themes/slot';

export interface PlaygroundTheme {
  container:            ThemeSlot;
  header:               ThemeSlot;

  // param inputs
  inputLabel:           ThemeSlot;
  textInput:            ThemeSlot; // variants: focused, error, disabled
  selectInput:          ThemeSlot; // variants: focused, error
  fileInput:            ThemeSlot;
  fileInputButton:      ThemeSlot; // variants: hasFile

  // body editor
  bodyEditor:           ThemeSlot; // variants: focused
  contentTypeSelector:  ThemeSlot;

  // send button
  sendButton:           ThemeSlot; // variants: loading, disabled

  // response panel
  responsePanel:        ThemeSlot;
  responseStatus:       ThemeSlot; // variants: success, redirect, clientError, serverError
  responseTime:         ThemeSlot;
  responseSize:         ThemeSlot;
  responseTabs:         ThemeSlot;
  responseTab:          ThemeSlot; // variants: active
  responseBody:         ThemeSlot;
  responseEmpty:        ThemeSlot;

  // error banner
  errorBanner:          ThemeSlot;
}
```

### `TopBarTheme` — top of `src/shared/components/TopBar.tsx`

```ts
import type { ThemeSlot } from '~/themes/slot';

export interface TopBarTheme {
  container:            ThemeSlot;
  title:                ThemeSlot;
  serverChip:           ThemeSlot; // variants: open
  themeButton:          ThemeSlot;
  authButton:           ThemeSlot; // variants: configured
  shortcutsButton:      ThemeSlot;
  loadButton:           ThemeSlot;
}
```

### `ModalTheme` — top of `src/shared/components/Modal.tsx`

```ts
import type { ThemeSlot } from '~/themes/slot';

export interface ModalTheme {
  backdrop:             ThemeSlot;
  container:            ThemeSlot;
  header:               ThemeSlot;
  title:                ThemeSlot;
  closeButton:          ThemeSlot;
  body:                 ThemeSlot;
  footer:               ThemeSlot;
}
```

### `SchemaTheme` — top of `src/features/schema/SchemaViewer.tsx`

```ts
import type { ThemeSlot } from '~/themes/slot';

export interface SchemaTheme {
  container:            ThemeSlot;
  tabBar:               ThemeSlot;
  tab:                  ThemeSlot; // variants: active

  // schema node tree
  nodeRow:              ThemeSlot; // variants: required, deprecated
  nodeKey:              ThemeSlot;
  nodeType:             ThemeSlot;
  nodeDescription:      ThemeSlot;
  nodeRequired:         ThemeSlot;
  nodeExpandButton:     ThemeSlot; // variants: open
  nodeNested:           ThemeSlot;

  // example viewer
  exampleBlock:         ThemeSlot;
}
```

### `AuthModalTheme` — top of `src/features/auth/AuthModal.tsx`

```ts
import type { ThemeSlot } from '~/themes/slot';

export interface AuthModalTheme {
  schemeSection:        ThemeSlot;
  schemeName:           ThemeSlot;
  schemeType:           ThemeSlot;
  schemeDescription:    ThemeSlot;
  tokenInput:           ThemeSlot; // variants: focused, filled
  usernameInput:        ThemeSlot; // variants: focused
  passwordInput:        ThemeSlot; // variants: focused
  saveButton:           ThemeSlot;
  clearButton:          ThemeSlot;
}
```

### `ServerConfigTheme` — top of `src/features/server/ServerConfig.tsx`

```ts
import type { ThemeSlot } from '~/themes/slot';

export interface ServerConfigTheme {
  chip:                 ThemeSlot; // variants: open
  popover:              ThemeSlot;
  serverOption:         ThemeSlot; // variants: selected
  variableLabel:        ThemeSlot;
  variableInput:        ThemeSlot; // variants: focused
  variableDescription:  ThemeSlot;
}
```

### `CommandBarTheme` — top of `src/shared/components/CommandBar.tsx`

```ts
import type { ThemeSlot } from '~/themes/slot';

export interface CommandBarTheme {
  backdrop:             ThemeSlot;
  container:            ThemeSlot;
  input:                ThemeSlot; // variants: focused
  resultItem:           ThemeSlot; // variants: highlighted
  resultLabel:          ThemeSlot;
  resultCategory:       ThemeSlot;
  emptyState:           ThemeSlot;
  shortcutBadge:        ThemeSlot;
}
```

### `SyntaxTheme` — top of `src/shared/utils/highlight.ts`

```ts
// Token colors for JSON syntax highlighting
export interface SyntaxTheme {
  key:     string;
  string:  string;
  boolean: string;
  null:    string;
  number:  string;
}
```

---

## `AppTheme` — the contract

`contract.ts` is a **composition-only** file. It imports every component theme interface and assembles the top-level type. It contains no slot definitions itself.

```ts
// src/themes/contract.ts

import type { NavTheme }          from '~/features/nav/Nav';
import type { EndpointTheme }     from '~/features/endpoint/EndpointDetail';
import type { PlaygroundTheme }   from '~/features/playground/Playground';
import type { TopBarTheme }       from '~/shared/components/TopBar';
import type { ModalTheme }        from '~/shared/components/Modal';
import type { SchemaTheme }       from '~/features/schema/SchemaViewer';
import type { AuthModalTheme }    from '~/features/auth/AuthModal';
import type { ServerConfigTheme } from '~/features/server/ServerConfig';
import type { CommandBarTheme }   from '~/shared/components/CommandBar';
import type { SyntaxTheme }       from '~/shared/utils/highlight';

export interface AppTheme {
  name:         string;          // display name, e.g. "Nord"
  nav:          NavTheme;
  endpoint:     EndpointTheme;
  playground:   PlaygroundTheme;
  topBar:       TopBarTheme;
  modal:        ModalTheme;
  schema:       SchemaTheme;
  authModal:    AuthModalTheme;
  serverConfig: ServerConfigTheme;
  commandBar:   CommandBarTheme;
  syntax:       SyntaxTheme;
  paneHandle:   string;          // bg color of the resize handle line
  focusRing:    string;          // Tailwind ring class, e.g. "ring-2 ring-blue-500"
  scrollbar:    { thumb: string; thumbHover: string };
}
```

---

## Theme context

```ts
// src/themes/context.tsx

const ThemeContext = createContext<AppTheme>(lightTheme);

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ theme, children }: {
  theme: AppTheme;
  children: ReactNode;
}) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
```

`ThemeProvider` wraps `AppProviders` in `shared/contexts/index.tsx`. The active theme is determined once in `App.tsx` (from mount options → localStorage → default) and passed down.

---

## Component usage pattern

```tsx
// src/features/nav/Nav.tsx

import { slot } from '~/themes/slot';
import { useTheme } from '~/themes/context';
import type { ThemeSlot } from '~/themes/slot';

export interface NavTheme {
  container:   ThemeSlot;
  searchInput: ThemeSlot; // variants: focused, hasValue
  tagHeader:   ThemeSlot;
  tagChevron:  ThemeSlot; // variants: open
  endpointItem: ThemeSlot; // variants: active, deprecated
  methodBadge:  ThemeSlot; // variants: get, post, put, patch, delete, head, options
  endpointPath: ThemeSlot;
  // ... rest of interface
}

function Nav() {
  const { nav: t } = useTheme();

  return (
    <aside className={slot(t.container)}>
      <input className={slot(t.searchInput, { focused: isFocused, hasValue: !!query })} />

      {groups.map(group => (
        <div key={group.name}>
          <button className={slot(t.tagHeader)}>
            <ChevronIcon className={slot(t.tagChevron, { open: isOpen })} />
          </button>
          {group.endpoints.map(ep => (
            <div className={slot(t.endpointItem, { active: ep === active, deprecated: !!ep.operation.deprecated })}>
              <span className={slot(t.methodBadge, { [ep.method]: true })}>
                {ep.method.toUpperCase()}
              </span>
              <span className={slot(t.endpointPath)}>{ep.path}</span>
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}
```

No `dark:` variants. No hardcoded colors. The component has no knowledge of what theme is active.

---

## Theme file structure

```
src/themes/
  slot.ts            # ThemeSlot type + slot() utility
  contract.ts        # AppTheme — imports component interfaces, adds global tokens
  context.tsx        # ThemeProvider + useTheme
  index.ts           # THEMES map, getTheme(), listThemes(), mergeTheme()
  presets/
    light.ts         # The reference implementation — doubles as documentation
    dark.ts
    ocean.ts
    nord.ts
    monokai.ts
    dracula.ts
    solarized-light.ts
    solarized-dark.ts
    high-contrast.ts
    catppuccin.ts
```

Each component file exports its `XxxTheme` interface. `contract.ts` re-imports them to build `AppTheme`. Theme preset files import `AppTheme` from `contract.ts` and satisfy the full interface.

### Adding a new theme

Copy any existing preset file, change the `name` field, adjust the class strings. TypeScript will error on any missing or misspelled slot. No other files change.

---

## Mount API

```ts
// Preset name
mountApiExplorer(el, { theme: 'nord' });

// Custom AppTheme object
mountApiExplorer(el, { theme: myBrandTheme });

// Partial override merged onto a base preset
import { lightTheme } from '@api-explorer/themes';
mountApiExplorer(el, {
  theme: mergeTheme(lightTheme, {
    nav: { container: 'bg-brand-950 border-r border-brand-800' }
  })
});
```

`mergeTheme(base, overrides)` does a shallow merge per component section — `overrides` keys replace the matching `base` keys, rest are inherited.

```ts
// src/themes/index.ts
export function mergeTheme(base: AppTheme, overrides: DeepPartial<AppTheme>): AppTheme {
  const result = { ...base };
  for (const key of Object.keys(overrides) as (keyof AppTheme)[]) {
    if (overrides[key] !== undefined) {
      result[key] = { ...(base[key] as object), ...(overrides[key] as object) } as never;
    }
  }
  return result;
}
```

---

## `AppTheme` state in `App.tsx`

```tsx
// App.tsx — replaces the darkMode boolean
const [theme, setTheme] = useState<AppTheme>(() => {
  const saved = localStorage.getItem('api-explorer-theme');
  return getTheme(saved ?? props.initialTheme ?? 'light');
});

// ThemeProvider wraps the app; root div no longer needs a .dark class
<ThemeProvider theme={theme}>
  ...
</ThemeProvider>
```

`style.css` removes all `.dark { ... }` blocks and `dark:` variant definitions. The `syntax` and `scrollbar` tokens from the active theme are applied as CSS vars on the root div (the same way `--hl-key` etc. are today) so that `highlight.ts` and the scrollbar styles still work without changes.

---

## Built-in themes (10)

| Key | Style |
| --- | --- |
| `light` | Clean white, blue accent — current default |
| `dark` | Dark gray, blue accent — current dark mode |
| `ocean` | Deep navy, cyan accent |
| `nord` | Arctic blue-gray palette |
| `monokai` | Dark brown/yellow, vivid method colors |
| `dracula` | Purple-tinted dark, pink/cyan accents |
| `solarized-light` | Warm off-white, muted tones |
| `solarized-dark` | Muted dark teal base |
| `high-contrast` | Pure black/white, WCAG AAA focus |
| `catppuccin` | Soft pastel dark (Mocha variant) |

---

## Work items

### Phase 1 — Foundation (no visible changes)

- [x] Create `src/themes/slot.ts` — `ThemeSlot` type and `slot()` function
- [x] Add `XxxTheme` interface to the top of each component file (see interfaces above)
- [x] Create `src/themes/contract.ts` — `AppTheme` that imports all component interfaces
- [x] Create `src/themes/context.tsx` — `ThemeProvider` and `useTheme`
- [x] Create `src/themes/index.ts` — `THEMES` map, `getTheme()`, `listThemes()`, `mergeTheme()`
- [x] Create `src/themes/presets/light.ts` — full reference implementation derived from current light mode styles
- [x] Create `src/themes/presets/dark.ts` — derived from current dark mode styles

### Phase 2 — Migration

- [ ] Replace `darkMode` boolean in `App.tsx` with `theme: AppTheme` state
- [ ] Wrap `AppProviders` with `ThemeProvider` in `shared/contexts/index.tsx`
- [ ] Migrate `Nav.tsx` — remove all `dark:` variants, use `useTheme()` + `slot()`
- [ ] Migrate `EndpointDetail.tsx`
- [ ] Migrate `Playground.tsx`
- [ ] Migrate `TopBar.tsx` — replace dark mode toggle with theme selector
- [ ] Migrate `Modal.tsx`, `LoadModal.tsx`, `AuthModal.tsx`
- [ ] Migrate `SchemaViewer.tsx`, `SchemaNode.tsx`, `SchemaDetail.tsx`
- [ ] Migrate `CommandBar.tsx`, `ServerConfig.tsx`
- [ ] Update `style.css` — remove `.dark {}` block; inject `syntax` + `scrollbar` CSS vars from active theme onto root element
- [ ] Update `mount.ts` — accept `theme` option (preset name or `AppTheme` object)

### Phase 3 — Additional themes

- [ ] `ocean.ts`
- [ ] `nord.ts`
- [ ] `monokai.ts`
- [ ] `dracula.ts`
- [ ] `solarized-light.ts`
- [ ] `solarized-dark.ts`
- [ ] `high-contrast.ts`
- [ ] `catppuccin.ts`

### Phase 4 — Theme picker UI

- [ ] Add theme name to `AppTheme` for display
- [ ] Theme selector in `TopBar` (dropdown or command bar action)
- [ ] Persist selection to `localStorage` under `api-explorer-theme`
- [ ] Expose `setTheme(name)` on the return value of `mountApiExplorer`

---

## Out of scope

- Typography, spacing, or layout variation between themes — only color and decorative classes
- Per-user theme creation UI — themes are code artefacts, not runtime-built objects
- CSS-only theme overrides (no Shadow DOM; embedders can override via the `theme` mount option or `mergeTheme`)
- Automatic system-preference detection beyond the existing light/dark initial default