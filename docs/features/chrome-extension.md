# Feature Spec: Chrome Extension — Swagger UI Enhancer

## Overview

A Chrome extension (Manifest V3) that detects Swagger UI on any page and replaces it with the API Explorer UI. A toolbar
icon turns active when Swagger UI is detected; a floating button lets users disable the replacement on the current site.

---

## Goals

- Zero-config for end users: install the extension, visit any Swagger UI page, and the enhanced UI loads automatically.
- Non-destructive: the original Swagger UI is hidden, not removed. Disabling the extension restores it instantly.
- Per-origin opt-out: disabling on one site does not affect others.

## Non-goals

- Supporting Swagger 2.0 / JSON UI only (detect only, degrade gracefully).
- A full settings page (future work).
- Firefox/Safari support in v1.

---

## Detection

Swagger UI can be identified by one or more of the following signals, checked in order:

| Priority | Signal                                             | How to check                            |
|----------|----------------------------------------------------|-----------------------------------------|
| 1        | `<div id="swagger-ui">` present in DOM             | `document.getElementById('swagger-ui')` |
| 2        | `window.SwaggerUIBundle` defined                   | check `typeof window.SwaggerUIBundle`   |
| 3        | `<link>` or `<style>` referencing `swagger-ui` CSS | scan `document.styleSheets` hrefs       |
| 4        | Meta tag `<meta name="swagger-ui" ...>`            | query selector                          |

Detection runs once on `document_idle` and re-runs on `DOMContentLoaded` for SPAs that mount Swagger after navigation.
If any signal is positive the extension activates.

The content script also watches for dynamic Swagger mounts via a `MutationObserver` on `document.body` so that SPAs that
inject Swagger UI after the initial load are caught without a page reload.

---

## Extension Architecture

```
extension/
  manifest.json          # MV3 manifest
  background.ts          # service worker — manages icon state, disabled-sites list
  content.ts             # injected into every page — detects Swagger, mounts API Explorer
  content.css            # host-page isolation styles (z-index, positioning)
  popup/
    popup.html           # toolbar popup (optional future settings)
    popup.ts
  assets/
    icon-16.png
    icon-32.png
    icon-48.png
    icon-128.png
    icon-active-16.png   # colored variant shown when Swagger is detected
    icon-active-32.png
    icon-active-48.png
    icon-active-128.png
```

The extension is a separate build target (e.g. `npm run build:ext`) that produces a `dist-ext/` folder ready to load as
an unpacked extension or publish to the Chrome Web Store. It imports `mountApiExplorer` from the main library bundle (
`dist/loader.js`), bundled into the extension via Vite.

---

## Toolbar Icon States

| State    | Icon                              | Badge        | When                             |
|----------|-----------------------------------|--------------|----------------------------------|
| Inactive | Grayscale / muted logo            | —            | Page has no Swagger UI           |
| Active   | Full-color logo                   | —            | Swagger UI detected and replaced |
| Disabled | Grayscale + strikethrough overlay | `OFF` in red | User disabled on this origin     |

Icon state is set from the content script by sending a message to the background service worker:

```ts
// content.ts
chrome.runtime.sendMessage({ type: 'SET_ICON', state: 'active' | 'inactive' | 'disabled' });
```

The background worker calls `chrome.action.setIcon` and `chrome.action.setBadgeText` per tab.

---

## Replacement Flow

1. Content script detects Swagger UI.
2. Content script sends `SET_ICON active` to background.
3. Content script queries background: "is this origin disabled?" via `GET_DISABLED_STATE`.
4. **If disabled**: skip replacement, icon stays in disabled state, floating button is still shown (to re-enable).
5. **If enabled**:
   a. Find the OpenAPI spec URL. Strategy (in order):
    - Look for `url:` or `urls:` in the `SwaggerUIBundle(...)` call via script scanning.
    - Check `<link rel="openapi" href="...">` or `<meta name="openapi-url" content="...">`.
    - Check common convention paths: `./openapi.json`, `./swagger.json`, `../openapi.json`.
    - Fall back to asking the user via a small inline prompt.
      b. Hide the Swagger UI container (`display: none`).
      c. Create a full-width, full-height `<div id="api-explorer-root">` sibling to the Swagger container.
      d. Call `mountApiExplorer(rootEl, { url: specUrl })`.
      e. Inject the floating toggle button.

---

## Floating Toggle Button

A fixed-position button rendered in the bottom-right corner of the page (not inside the API Explorer root, so it
survives unmounting).

```
┌─────────────────────────────────────────┐
│                                         │
│  [API Explorer content]                 │
│                                         │
│                         ┌────────────┐  │
│                         │ ⚡ Disable │  │
│                         └────────────┘  │
└─────────────────────────────────────────┘
```

**Behavior when clicked (enabled → disabled)**:

1. Send `DISABLE_ORIGIN { origin }` to background (persists in `chrome.storage.local`).
2. Unmount API Explorer (`cleanup()` from `mountApiExplorer` return value).
3. Remove `api-explorer-root` div.
4. Restore Swagger UI container (`display: ""`).
5. Send `SET_ICON disabled` to background.
6. Button label changes to **"Enable API Explorer"**.

**Behavior when clicked (disabled → enabled)**:

1. Send `ENABLE_ORIGIN { origin }` to background.
2. Re-run the replacement flow (step 5 above).
3. Send `SET_ICON active`.
4. Button label changes back to **"Disable"**.

The button is always present when the page has Swagger UI, regardless of enabled/disabled state, so the user can always
toggle.

### Button style

- `position: fixed; bottom: 1.25rem; right: 1.25rem; z-index: 2147483647`
- Pill shape, small shadow, matches the API Explorer brand color.
- Respects `prefers-color-scheme` via a small inline style block injected alongside it.

---

## Disabled Sites Storage

```ts
// background.ts
// shape: { disabledOrigins: string[] }
// e.g. { disabledOrigins: ["https://petstore.swagger.io", "http://localhost:8080"] }
chrome.storage.local.get('disabledOrigins', ...)
chrome.storage.local.set({ disabledOrigins: [...] })
```

The content script checks this on each page load before deciding whether to activate.

---

## Spec URL Discovery — Detail

The content script inlines a small synchronous scanner that reads the text of all `<script>` tags already present on the
page and looks for patterns like:

```
SwaggerUIBundle({ url: "...", ...
SwaggerUIBundle({ urls: [{url: "...", ...
```

It captures the first match with a regex and uses it as `specUrl`. This covers the most common Swagger UI integration
pattern with zero network requests.

If no URL is found from scripts, it falls back to probing standard paths with `HEAD` requests (checking
`Content-Type: application/json` or `application/yaml`) before prompting the user.

---

## Permissions (manifest.json)

```json
{
  "permissions": ["storage", "scripting", "activeTab"],
  "host_permissions": ["<all_urls>"]
}
```

`<all_urls>` is required so the content script can run on any Swagger-hosting domain. This will be disclosed clearly in
the Chrome Web Store listing.

---

## Build Integration

Add to `package.json`:

```json
"scripts": {
  "build:ext": "vite build --config vite.ext.config.ts"
}
```

`vite.ext.config.ts` produces a `dist-ext/` folder. The extension bundle imports `loader.js` directly so that font/style
injection works identically to the embed use case.

---

## Out of Scope (v1)

- Safari / Firefox support
- Options page for managing disabled sites (use popup in v2)
- Theming controls inside the extension
- Auto-update spec on page SPA navigation (v2 — needs smarter lifecycle hooks)
- Chrome Web Store publishing pipeline (separate task)