# Theme Centralization — Migration Spec

## Goal

Move every `XxxTheme` interface and every `xxxTheme` style object out of component files and
into a single central location under `src/themes/`. After migration:

- **All Tailwind class strings for a theme live in one file** — `src/themes/presets/light.ts`
  (or `dark.ts`, `ocean.ts`, etc.). An LLM can read that file and generate a new theme by
  filling in the same structure with different values.
- Component files contain **zero styling**. They only call `useTheme()` and reference slots by name.
- Adding a new theme is one new `src/themes/presets/<name>.ts` file, nothing else.

---

## Current state (what needs to move)

Each component currently owns both its `XxxTheme` interface and its
`xxxTheme: Record<ThemeMode, XxxTheme>` values. 26 components follow this pattern.

Additionally, `DetailPane.tsx` and `VerticalResizable.tsx` still use raw `dark:` Tailwind
variants and have never been converted to slot theming at all.

### Full inventory

| Component file | Interface | Style object |
|---|---|---|
| `src/App.tsx` | `AppRootTheme` | `appTheme` |
| `src/features/nav/Nav.tsx` | `NavTheme` | `navTheme` |
| `src/features/endpoint/EndpointDetail.tsx` | `EndpointTheme` | `endpointTheme` |
| `src/features/auth/AuthModal.tsx` | `AuthModalTheme` | `authModalTheme` |
| `src/features/server/ServerConfig.tsx` | `ServerConfigTheme` | `serverConfigTheme` |
| `src/features/schema/SchemaViewer.tsx` | `SchemaViewerTheme` | `schemaViewerTheme` |
| `src/features/schema/SchemaNode.tsx` | `SchemaNodeTheme` | `schemaNodeTheme` |
| `src/features/schema/SchemaDetail.tsx` | `SchemaDetailTheme` | `schemaDetailTheme` |
| `src/features/playground/Playground.tsx` | `PlaygroundTheme` | `playgroundTheme` |
| `src/features/playground/AuthStatus.tsx` | `AuthStatusTheme` | `authStatusTheme` |
| `src/features/playground/BodyEditor.tsx` | `BodyEditorTheme` | `bodyEditorTheme` |
| `src/features/playground/ParamLabel.tsx` | `ParamLabelTheme` | `paramLabelTheme` |
| `src/features/playground/ResponsePanel.tsx` | `ResponsePanelTheme` | `responsePanelTheme` |
| `src/features/playground/SendBar.tsx` | `SendBarTheme` | `sendBarTheme` |
| `src/features/playground/inputs/ArrayInput.tsx` | `ArrayInputTheme` | `arrayInputTheme` |
| `src/features/playground/inputs/BooleanSelect.tsx` | `BooleanSelectTheme` | `booleanSelectTheme` |
| `src/features/playground/inputs/EnumSelect.tsx` | `EnumSelectTheme` | `enumSelectTheme` |
| `src/features/playground/inputs/FileInput.tsx` | `FileInputTheme` | `fileInputTheme` |
| `src/features/playground/inputs/MultiSelect.tsx` | `MultiSelectTheme` | `multiSelectTheme` |
| `src/features/playground/inputs/ObjectInput.tsx` | `ObjectInputTheme` | `objectInputTheme` |
| `src/features/playground/inputs/ScalarInput.tsx` | `ScalarInputTheme` | `scalarInputTheme` |
| `src/shared/components/CommandBar.tsx` | `CommandBarTheme` | `commandBarTheme` |
| `src/shared/components/LoadModal.tsx` | `LoadModalTheme` | `loadModalTheme` |
| `src/shared/components/Modal.tsx` | `ModalTheme` | `modalTheme` |
| `src/shared/components/TopBar.tsx` | `TopBarTheme` | `topBarTheme` |
| `src/shared/utils/highlight.ts` | `SyntaxTheme` | _(inline, via CSS vars)_ |
| `src/features/nav/DetailPane.tsx` | _(none yet — uses `dark:`)_ | _(none yet)_ |
| `src/shared/components/VerticalResizable.tsx` | _(none yet — uses `dark:`)_ | _(none yet)_ |

---

## Target file structure

```
src/themes/
  slot.ts            # ThemeSlot type + slot() — unchanged
  types.ts           # ThemeMode — unchanged
  context.tsx        # ThemeProvider + useTheme() — unchanged
  index.ts           # THEMES registry, getTheme(), listThemes(), mergeTheme() — unchanged
  contract.ts        # AppTheme interface — UPDATED (all imports come from themes/components/)
  components/        # NEW: one .ts file per component; contains ONLY the XxxTheme interface
    app-root.ts
    nav.ts
    endpoint.ts
    auth-modal.ts
    server-config.ts
    schema-viewer.ts
    schema-node.ts
    schema-detail.ts
    playground.ts
    auth-status.ts
    body-editor.ts
    param-label.ts
    response-panel.ts
    send-bar.ts
    inputs.ts          # all seven input types in one file (they are small)
    command-bar.ts
    load-modal.ts
    modal.ts
    top-bar.ts
    detail-pane.ts     # NEW — needs interface written from scratch
    vertical-resizable.ts  # NEW — needs interface written from scratch
    syntax.ts
  presets/
    light.ts           # full AppTheme object — the reference theme, LLM template
    dark.ts            # full AppTheme object
    # future: ocean.ts, nord.ts, monokai.ts, dracula.ts, ...
```

---

## AppTheme contract changes

`src/themes/contract.ts` changes in two ways:

1. All `import type` lines switch from component files to `./components/<name>`.
2. The following keys are **added** to `AppTheme` for sub-components that are currently missing:

```ts
export interface AppTheme {
  name: string;

  // already present — no key changes, just import source changes
  nav:          NavTheme;
  endpoint:     EndpointTheme;
  topBar:       TopBarTheme;
  modal:        ModalTheme;
  authModal:    AuthModalTheme;
  serverConfig: ServerConfigTheme;
  commandBar:   CommandBarTheme;
  schema:       SchemaViewerTheme;
  syntax:       SyntaxTheme;
  paneHandle:   string;
  focusRing:    string;
  scrollbar:    { thumb: string; thumbHover: string };

  // ADD — sub-components that currently bypass AppTheme
  appRoot:          AppRootTheme;
  loadModal:        LoadModalTheme;
  schemaNode:       SchemaNodeTheme;
  schemaDetail:     SchemaDetailTheme;
  playground:       PlaygroundTheme;
  authStatus:       AuthStatusTheme;
  bodyEditor:       BodyEditorTheme;
  paramLabel:       ParamLabelTheme;
  responsePanel:    ResponsePanelTheme;
  sendBar:          SendBarTheme;
  inputScalar:      ScalarInputTheme;
  inputBoolean:     BooleanSelectTheme;
  inputEnum:        EnumSelectTheme;
  inputFile:        FileInputTheme;
  inputArray:       ArrayInputTheme;
  inputMultiSelect: MultiSelectTheme;
  inputObject:      ObjectInputTheme;
  detailPane:       DetailPaneTheme;
  verticalResizable: VerticalResizableTheme;
}
```

All keys are flat — no nesting under `playground.*`. Flat means less typing in preset files
and no breaking change to existing `theme.schema.*` usages.

---

## Migration pattern (before → after)

For every component the transformation is identical; only the names differ.

### Before (inside `SchemaViewer.tsx`)

```ts
// interface defined in component file
export interface SchemaViewerTheme {
  tabBar:       ThemeSlot;
  tabActive:    ThemeSlot;
  tabInactive:  ThemeSlot;
  description:  ThemeSlot;
  exampleBlock: ThemeSlot;
}

// style object in component file
export const schemaViewerTheme: Record<ThemeMode, SchemaViewerTheme> = {
  default: {
    tabBar:       'flex gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100',
    tabActive:    'px-3 py-1 text-[11px] ... bg-white text-gray-700 ...',
    // ...
  },
  dark: {
    tabBar:       'flex gap-1 px-3 py-2 bg-gray-800/80 border-b border-gray-700',
    // ...
  },
};

// component reads mode and selects theme
const t = schemaViewerTheme[useThemeMode()];
```

### After

**`src/themes/components/schema-viewer.ts`** — interface only, zero style values:

```ts
import type { ThemeSlot } from '../slot';

export interface SchemaViewerTheme {
  tabBar:       ThemeSlot;
  tabActive:    ThemeSlot;
  tabInactive:  ThemeSlot;
  description:  ThemeSlot;
  exampleBlock: ThemeSlot;
}
```

**`src/themes/presets/light.ts`** — all style values for all components, one object:

```ts
import type { AppTheme } from '../contract';

export const lightTheme: AppTheme = {
  name: 'light',
  // ...other components...
  schema: {
    tabBar:       'flex gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100',
    tabActive:    'px-3 py-1 text-[11px] font-medium rounded-md bg-white text-gray-700 border border-gray-200',
    tabInactive:  'px-3 py-1 text-[11px] font-medium rounded-md text-gray-400 hover:text-gray-600 transition-colors',
    description:  'px-4 pt-3 pb-0 text-[11px] text-gray-500 leading-relaxed',
    exampleBlock: 'text-[11px] bg-gray-50 rounded-md p-3 overflow-x-auto text-gray-700 font-mono leading-relaxed',
  },
  // ...
};
```

**`src/features/schema/SchemaViewer.tsx`** — interface and style object removed; component reads from context:

```ts
// REMOVED: export interface SchemaViewerTheme { ... }
// REMOVED: export const schemaViewerTheme: Record<ThemeMode, ...> = { ... }
// REMOVED: import { useThemeMode } from '../../shared/contexts/theme-mode-context';

import { useTheme } from '../../themes/context';

// inside component:
const t = useTheme().schema;
```

---

## How to add a new theme after migration

1. Copy `src/themes/presets/light.ts` to `src/themes/presets/ocean.ts`.
2. Change `name: 'light'` → `name: 'ocean'`.
3. Replace color classes throughout the file. TypeScript will error on any missing slot.
4. Register it: in `src/themes/index.ts`, add `import { oceanTheme } from './presets/ocean'`
   and `THEMES['ocean'] = oceanTheme`.

The LLM workflow: paste `light.ts` as context, ask the model to produce a variation with a
new color palette. The file is self-contained and fully annotated by slot names.

---

## Migration order (component by component)

Each step is independently shippable: extract the interface, populate both presets, update the
component. TypeScript must pass after each step (`npm run typecheck`).

The order is dependency-first — leaf components before parents so the parent's preset entries
are ready when the parent is migrated.

### Step 1 — Scaffolding (no component changes)

- Create `src/themes/components/` directory with one `.ts` stub per component (interface only,
  copy from current component file).
- Update `src/themes/contract.ts`: change all imports to `./components/<name>`, add the missing
  keys listed above.
- Create `src/themes/presets/light.ts` and `src/themes/presets/dark.ts` as empty `AppTheme`
  objects — TypeScript will immediately flag every missing slot.
- Register `lightTheme` and `darkTheme` in `src/themes/index.ts`.

At this point the app still runs unchanged (old component-local themes still used).

### Step 2 — Migrate shared/utils

**`src/shared/utils/highlight.ts`** → `src/themes/components/syntax.ts`

- Move `SyntaxTheme` interface.
- `highlight.ts` no longer exports `SyntaxTheme`; import it from `../../themes/components/syntax`.
- Add `syntax` values to both presets (extract from current CSS var injection in `App.tsx`).

### Step 3 — Migrate shared/components (bottom-up)

Order: `Modal` → `LoadModal` → `CommandBar` → `TopBar`

For each:
1. Copy interface to `src/themes/components/<name>.ts`.
2. Fill `modal:` / `loadModal:` / `commandBar:` / `topBar:` in both preset files.
3. In component: remove interface + style object + `useThemeMode()` import; add `useTheme()`;
   replace `const t = xxxTheme[mode]` with `const t = useTheme().<key>`.

### Step 4 — Migrate schema (leaf → root)

Order: `SchemaNode` → `SchemaDetail` → `SchemaViewer`

- `schemaNode`, `schemaDetail`, `schema` keys in both presets.

### Step 5 — Migrate auth + server

`AuthModal` → `ServerConfig`

- `authModal`, `serverConfig` keys.

### Step 6 — Migrate playground inputs

Order (any order, all are leaves):
`ScalarInput` → `BooleanSelect` → `EnumSelect` → `FileInput` →
`ArrayInput` → `MultiSelect` → `ObjectInput`

All go in `src/themes/components/inputs.ts`.
Add `inputScalar`, `inputBoolean`, `inputEnum`, `inputFile`, `inputArray`,
`inputMultiSelect`, `inputObject` keys to both presets.

### Step 7 — Migrate playground sub-components

Order: `ParamLabel` → `BodyEditor` → `AuthStatus` → `SendBar` → `ResponsePanel`

Add `paramLabel`, `bodyEditor`, `authStatus`, `sendBar`, `responsePanel` keys.

### Step 8 — Migrate Playground (parent)

Add `playground` key.

### Step 9 — Migrate nav (DetailPane + Nav)

`DetailPane` needs a new interface written from scratch (currently uses raw `dark:` variants).
Slots needed: `errorIcon`, `errorMessage`, `retryLink`, `spinner`, `emptyIcon`, `emptyMessage`.

Order: `DetailPane` → `Nav`

Add `detailPane`, `nav` keys.

### Step 10 — Migrate endpoint

`EndpointDetail` → add `endpoint` key.

### Step 11 — Migrate VerticalResizable

New interface: one slot — `handle` (the resize divider line).
Add `verticalResizable` key.

### Step 12 — Migrate App root + wire up

- Move `AppRootTheme` / `appTheme` from `App.tsx` → `themes/components/app-root.ts` +
  preset files (`appRoot` key).
- Replace `darkMode: boolean` state in `App.tsx` with `theme: AppTheme` state
  (initialized from `localStorage`/`prefers-color-scheme` → maps to `lightTheme` or `darkTheme`).
- `ThemeProvider` wraps the app in place of `ThemeModeProvider`.
- Delete `src/shared/contexts/theme-mode-context.tsx` (no more consumers).

### Step 13 — Clean up

- `npm run typecheck` — must pass with zero errors.
- `npm run build:lib` — bundle size delta should be negligible (style strings moved, not grown).
- Remove `ThemeModeProvider` from `AppProviders` in `shared/contexts/index.tsx`.
- Remove all `dark:` variant classes from `style.css` that are now covered by theme slots.
- Confirm no component file still imports from `../../themes/types` or
  `../../shared/contexts/theme-mode-context`.

---

## Constraints

- No component file may import `ThemeMode` or call `useThemeMode()` after migration.
- No component file may export a `XxxTheme` interface or `xxxTheme` style object after migration.
- No `dark:` Tailwind variants anywhere in `.tsx` or `.ts` files after migration
  (they may remain in `style.css` for global structural rules only).
- Each step must leave `typecheck` passing — no "I'll fix the types later" deferrals.
- Do not change slot names in existing components during migration — that is a separate task.
  Only move the data; the slot vocabulary stays identical.