# Embed Starter — Integration Code Generator

| Field | Value |
|---|---|
| **Status** | Draft |
| **Created** | 2026-05-17 |
| **Area** | `src/components/EmbedStarter.tsx`, `src/mount.ts`, `src/types/openapi.ts` |

---

## Summary

Add an **Embed Starter** panel — a visual configurator that lets anyone generate a ready-to-paste integration snippet for the API Explorer. The user picks a spec URL, toggles features on/off, tweaks the visual theme, and gets HTML / JS / React embed code that reflects every setting, all while seeing a live preview of the result.

---

## Motivation

The current embed story is: read the README, write the snippet by hand, iterate in code.  
The Embed Starter removes that friction entirely. The target audience is:

- **Developers** dropping the explorer into a docs site who want to customise colours, hide the Playground, add their logo, etc.
- **Non-developers** (DevRel, product) who need a working snippet fast without touching `mountApiExplorer` internals.

The feature also forces a clean, documented `ExplorerOptions` contract that the mount API should have had from day one.

---

## Goals

- One-stop configurator: spec URL, feature flags, theme, i18n — all editable in a side panel.
- Live preview that reflects every option change instantly.
- Three generated code formats: HTML (data-attribute), JS (mount call), React component.
- One-click copy for each format.
- No runtime dependencies beyond what already exists — the preview reuses `<App>`.

## Non-goals

- Hosting / CDN management — we only generate the snippet; where the bundle lives is out of scope.
- Saving / sharing configurations — no persistence in v1 (localStorage or URLs are a follow-on).
- Custom CSS injection or full theming beyond the defined `ExplorerTheme` options.

---

## Mount API changes (prerequisite)

Before building the UI, `mount.ts` and `App.tsx` must accept an expanded options object.

### New `ExplorerOptions` type  (`src/types/openapi.ts`)

```ts
export interface ExplorerTheme {
  /** CSS hex colour used as the primary interactive accent (buttons, links, active states). */
  primaryColor?: string;
  /** URL of a logo image that replaces the auto-generated monogram tile in the TopBar. */
  logo?: string;
  /** Start in dark mode regardless of OS preference. Default: false. */
  defaultDark?: boolean;
  /** Override the UI font family. Accepts any valid CSS font-family string. */
  fontFamily?: string;
}

export interface ExplorerFeatures {
  /** Show the Authorize button. Default: true. */
  showAuth?: boolean;
  /** Show the Try-it-out (Playground) panel. Default: true. */
  showTryIt?: boolean;
  /** Show the dark-mode toggle in the TopBar. Default: true. */
  showDarkModeToggle?: boolean;
  /** Show the "Load spec" button in the TopBar. Default: true. */
  showLoadSpec?: boolean;
  /** Show the keyboard shortcuts button. Default: true. */
  showShortcuts?: boolean;
  /** Show the server URL chip and variable editor. Default: true. */
  showServerConfig?: boolean;
}

export interface ExplorerI18n {
  /** BCP-47 language tag used for UI strings. Default: 'en'. */
  language?: string;
}

export interface ExplorerOptions {
  /** URL of the OpenAPI 3.x spec to load on startup. */
  url?: string;
  theme?: ExplorerTheme;
  features?: ExplorerFeatures;
  i18n?: ExplorerI18n;
}
```

`mountApiExplorer(target, options?: ExplorerOptions)` — the signature widens; existing callers passing only `{ url }` are unaffected.

`App` props mirror the same shape: `{ initialUrl?, theme?, features?, i18n? }`.  
Contexts that need feature flags consume them via a new `useConfig()` context or as props drilled through `AppInner`.

### Theme application

| Option | Mechanism |
|---|---|
| `primaryColor` | Injected as `--explorer-primary` CSS custom property on the root div. All `bg-blue-600`, `text-blue-600`, etc. button classes are replaced with `var(--explorer-primary)` via a thin utility. |
| `logo` | `TopBar` renders `<img src={logo}>` instead of the monogram tile when set. |
| `defaultDark` | Used as the initial value for `darkMode` state in `AppInner` (today it reads from `localStorage` / `prefers-color-scheme`). |
| `fontFamily` | Applied via `style={{ fontFamily }}` on the root div (already done for the default font). |

---

## UI design

### Entry point

A **"Get embed code"** button is added to the TopBar, rightmost, next to "Load spec". Icon: `</>` code brackets.  
Clicking it opens the Embed Starter as a full-screen overlay (similar to the shortcuts modal but much larger).

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Embed Starter                                          [✕ Close]│
├───────────────────────┬─────────────────────────────────────────┤
│  CONFIGURATION        │  LIVE PREVIEW                           │
│  ─────────────────    │                                         │
│  Spec URL             │  ┌─────────────────────────────────┐   │
│  [https://...]        │  │  < actual <App> render >        │   │
│                       │  │  (inside an isolated iframe)    │   │
│  ── FEATURES ──────   │  └─────────────────────────────────┘   │
│  [✓] Try-it-out       │                                         │
│  [✓] Auth button      │  ── EMBED CODE ──────────────────────  │
│  [✓] Server config    │                                         │
│  [✓] Dark mode toggle │  [HTML]  [JavaScript]  [React]         │
│  [✓] Load spec button │                                         │
│  [✓] Shortcuts        │  ┌─────────────────────────────────┐   │
│                       │  │  <div id="api-explorer"></div>  │   │
│  ── APPEARANCE ─────  │  │  <script src="loader.js">       │   │
│  Primary color  [●]   │  │  </script>                      │   │
│  Logo URL       [  ]  │  │  <script>                       │   │
│  Default theme  [○●]  │  │    mountApiExplorer(...)        │   │
│  Font family    [▾]   │  │  </script>                      │   │
│                       │  └─────────────────────────────────┘   │
│  ── LANGUAGE ───────  │                                         │
│  Language       [▾]   │  [Copy code]                           │
└───────────────────────┴─────────────────────────────────────────┘
```

The configuration panel is scrollable. The preview and code sections on the right update live (debounced ~300 ms on text inputs, instant on toggles).

### Configuration panel — all controls

#### Spec Source

| Control | Type | Note |
|---|---|---|
| Spec URL | Text input | Pre-populated from the currently loaded spec URL if present. |

#### Features (toggle row each)

| Label | `features` key | Default |
|---|---|---|
| Try-it-out panel | `showTryIt` | on |
| Authorize button | `showAuth` | on |
| Server config chip | `showServerConfig` | on |
| Dark mode toggle | `showDarkModeToggle` | on |
| Load spec button | `showLoadSpec` | on |
| Keyboard shortcuts | `showShortcuts` | on |

Each row: label on the left, toggle switch on the right. A one-line description of what disabling it does appears beneath the label in muted text.

#### Appearance

| Label | `theme` key | Control | Notes |
|---|---|---|---|
| Primary color | `primaryColor` | Color swatch + hex text input | Default `#3B82F6` (blue-500). Swatch opens a native `<input type="color">`. |
| Logo URL | `logo` | Text input | Placeholder: leave blank to use auto monogram. Shows a tiny preview thumbnail when set. |
| Default theme | `defaultDark` | Light / Dark segmented control | Overrides OS preference for initial state. |
| Font family | `fontFamily` | Select: IBM Plex Sans · System UI · Custom | When "Custom" is picked, a text input appears. |

#### Language

| Label | `i18n` key | Control |
|---|---|---|
| Language | `language` | Select: English (en) · French (fr) · German (de) · Spanish (es) · Japanese (ja) |

Language support is a placeholder in v1 — the select exists and is reflected in the generated code, but actual translated strings are a follow-on feature. The dropdown shows "Coming soon" states for non-English options to signal the intent.

---

### Live preview

Rendered in a sandboxed `<iframe>` on the right side. The iframe's `src` is a blob URL built from a minimal HTML page that calls `mountApiExplorer` with the current `ExplorerOptions`. It is rebuilt on every debounced config change.

Using an iframe (rather than rendering `<App>` inline) avoids CSS and state collisions between the Starter UI and the preview instance, and makes the preview an honest representation of what the embed code actually produces.

The iframe gets `title="Embed preview"` and `sandbox="allow-scripts allow-same-origin"`.

---

### Code output

Three tabs — **HTML**, **JavaScript**, **React** — each showing a highlighted read-only code block. A "Copy" button in the top-right corner of the block copies the raw string to the clipboard.

Tabs that are functionally identical (e.g. all options are defaults) still render their respective format — no tabs are hidden.

#### HTML tab

Uses the `data-api-explorer` auto-mount attribute. Theme and feature options are encoded as separate `data-` attributes.

```html
<div
  id="api-explorer"
  data-api-explorer="https://api.example.com/openapi.json"
  data-explorer-theme='{"primaryColor":"#3B82F6"}'
  data-explorer-features='{"showTryIt":true,"showAuth":false}'
  style="height: 100vh;"
></div>
<script src="https://cdn.example.com/api-explorer/loader.js"></script>
```

Default-value options are **omitted** from the generated JSON blobs to keep the snippet minimal.

#### JavaScript tab

Uses the `mountApiExplorer` function directly. Suitable for SPAs or environments where the script is bundled.

```html
<div id="api-explorer" style="height: 100vh;"></div>
<script src="https://cdn.example.com/api-explorer/loader.js"></script>
<script>
  mountApiExplorer(document.getElementById('api-explorer'), {
    url: 'https://api.example.com/openapi.json',
    theme: {
      primaryColor: '#E11D48',
      defaultDark: true,
    },
    features: {
      showAuth: false,
    },
  });
</script>
```

#### React tab

A thin wrapper component pattern. Suitable for React projects that import the library.

```tsx
import { useEffect, useRef } from 'react';
import { mountApiExplorer } from '@your-org/api-explorer';

export function ApiExplorer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return mountApiExplorer(ref.current, {
      url: 'https://api.example.com/openapi.json',
      theme: { primaryColor: '#E11D48', defaultDark: true },
      features: { showAuth: false },
    });
  }, []);

  return <div ref={ref} style={{ height: '100vh' }} />;
}
```

---

## State management

The Embed Starter is self-contained. Its configuration state lives in local `useState` inside `EmbedStarter.tsx` — it does not touch any of the six app-level contexts. This keeps it independent and easy to extract or test.

```ts
interface StarterState {
  url: string;
  theme: Required<ExplorerTheme>;
  features: Required<ExplorerFeatures>;
  i18n: Required<ExplorerI18n>;
  activeTab: 'html' | 'js' | 'react';
}
```

The `modalContext` gains one new flag: `starterVisible: boolean` / `setStarterVisible`. The "Get embed code" button sets it; the overlay close button clears it.

---

## File plan

| File | Change |
|---|---|
| `src/types/openapi.ts` | Add `ExplorerTheme`, `ExplorerFeatures`, `ExplorerI18n`, `ExplorerOptions`. |
| `src/mount.ts` | Widen `options` to `ExplorerOptions`; pass `theme`, `features`, `i18n` to `App`. |
| `src/App.tsx` | Accept and forward `theme`, `features`, `i18n` props; apply theme to root div; gate TopBar controls via `features`. |
| `src/components/TopBar.tsx` | Accept `features` prop; conditionally render auth, dark mode, shortcuts, load-spec buttons; render logo image when `theme.logo` is set. |
| `src/contexts/modal-context.tsx` | Add `starterVisible` / `setStarterVisible`. |
| `src/components/EmbedStarter.tsx` | New component — the full configurator overlay. |
| `src/utils/code-gen.ts` | New utility — pure functions that take `ExplorerOptions` and return the three code strings. |

---

## Acceptance criteria

- [ ] `mountApiExplorer(el, { theme: { primaryColor: '#E11D48' } })` visually changes all blue accents to rose-600 without any other code changes.
- [ ] `mountApiExplorer(el, { features: { showTryIt: false } })` hides the Playground panel and its resize handle completely.
- [ ] `mountApiExplorer(el, { features: { showLoadSpec: false } })` removes the "Load spec" button from the TopBar.
- [ ] `mountApiExplorer(el, { theme: { logo: 'https://example.com/logo.png' } })` replaces the monogram tile with the logo image.
- [ ] `mountApiExplorer(el, { theme: { defaultDark: true } })` starts in dark mode even when the OS is in light mode.
- [ ] Opening the Embed Starter with a spec already loaded pre-populates the URL field.
- [ ] Toggling any feature switch updates both the live preview and all three code tabs within 300 ms.
- [ ] Generated HTML, JS, and React snippets each paste into a real page and produce a working explorer with the configured options applied.
- [ ] Omits default-value keys from generated snippets (only non-defaults appear in JSON blobs).
- [ ] "Copy" button writes the correct raw code string to the clipboard.
- [ ] All new exported functions have JSDoc; `EmbedStarter.tsx` has a top-of-file doc comment.
- [ ] `npm run typecheck` passes with `noUnusedLocals` and `noImplicitReturns` enforced.

---

## Open questions

1. **CDN URL placeholder** — the generated snippets need a real `loader.js` URL. For now, use a comment placeholder `/* replace with your CDN URL */`. Revisit once we publish to a CDN or npm.
2. **`data-` attribute parsing** — the auto-mount path in `loader.ts` currently only reads `data-api-explorer` for the URL. We need to also parse `data-explorer-theme` and `data-explorer-features` JSON blobs and pass them to `mountApiExplorer`. This is a small addition to `loader.ts`.
3. **iframe preview isolation** — on `localhost` the blob-URL iframe can call `mountApiExplorer` from the parent window, but in a cross-origin deploy the library must be bundled into the blob. Investigate whether passing `loader.js` content as an inline `<script>` inside the blob HTML is acceptable, or if we need a dedicated `/preview` route.
4. **Language strings** — before shipping the language dropdown as anything other than a code-gen hint, we need an i18n strategy (e.g. a `strings` prop with overridable keys, or a full i18n library). The dropdown is included in v1 as a forward-looking affordance only.
