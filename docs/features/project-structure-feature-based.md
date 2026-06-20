# Project Structure: Feature-Based Reorganization

| Field       | Value                                      |
|-------------|--------------------------------------------|
| **Status**  | Draft                                      |
| **Created** | 2026-05-17                                 |
| **Type**    | Refactor — no behavior change              |
| **Related** | `docs/features/playground-param-inputs.md` |

---

## Summary

Reorganize `src/` from a type-based flat layout (`components/`, `contexts/`, `parser/`, `state/`) into a feature-based
layout where every feature owns its context, components, and local logic together.
Cross-cutting concerns move to `shared/`. No runtime behavior changes — only file locations and import paths change.

---

## Motivation

The current structure groups files by technical role (all contexts together, all components together) rather than by
what they do. This creates friction as the codebase grows:

- Adding a feature requires touching `components/`, `contexts/`, and `state/` simultaneously with no clear home for
  feature-local files
- `components/` is a flat list of 11 unrelated files that will grow further with the playground refactor
- `pages/` and `components/` are an arbitrary distinction — `DetailPane` is not meaningfully different from a component
- The upcoming playground refactor (`playground-param-inputs.md`) will add ~10 files; without a feature folder they have
  nowhere clean to live
- New contributors must learn which layer owns which concern before they can place a new file

A feature-based structure makes the answer to "where does this file go?" obvious: find the feature it belongs to.

---

## Goals

- Each feature is self-contained: its context, components, and local utilities live together
- A new contributor can find everything related to `playground` by looking in one folder
- The playground refactor slots directly into `features/playground/` without further structural decisions
- `shared/` contains only things genuinely used by two or more features
- Import paths remain clean — no `../../../../` chains
- Zero behavior or API changes

## Non-goals

- Changing the public `launch` API or bundle output
- Moving `style.css`, `vite-env.d.ts`, entry points (`main.tsx`, `mount.ts`, `loader.ts`)
- Splitting contexts into smaller pieces or changing the state architecture
- Adding path aliases (beneficial, but a separate task)

---

## Proposed Structure

This section shows only files that **currently exist** and where they will move. Files planned for creation as part of
separate feature work are listed in [Planned additions](#planned-additions) below.

```
src/
  features/
    spec/
      spec-context.tsx         ← was contexts/spec-context.tsx
      spec-parser.ts           ← was parser/spec-parser.ts
      ref-resolver.ts          ← was parser/ref-resolver.ts
      example-gen.ts           ← was parser/example-gen.ts
      openapi.ts               ← was types/openapi.ts
    nav/
      nav-context.tsx          ← was contexts/nav-context.tsx
      Nav.tsx                  ← was components/Nav.tsx
      DetailPane.tsx           ← was pages/DetailPane.tsx
      EndpointDetail.tsx       ← was pages/EndpointDetail.tsx
      SchemaDetail.tsx         ← was pages/SchemaDetail.tsx
    playground/
      playground-context.tsx   ← was contexts/playground-context.tsx
      Playground.tsx           ← was components/Playground.tsx
    auth/
      auth-context.tsx         ← was contexts/auth-context.tsx
      AuthModal.tsx            ← was components/AuthModal.tsx
    server/
      server-context.tsx       ← was contexts/server-context.tsx
      ServerConfig.tsx         ← was components/ServerConfig.tsx
    schema/
      SchemaViewer.tsx         ← was components/SchemaViewer.tsx
      SchemaNode.tsx           ← was components/SchemaNode.tsx
  shared/
    contexts/
      modal-context.tsx        ← was contexts/modal-context.tsx
      index.tsx                ← was contexts/index.tsx (re-exports all contexts)
    components/
      Modal.tsx                ← was components/Modal.tsx
      LoadModal.tsx            ← was components/LoadModal.tsx
      CommandBar.tsx           ← was components/CommandBar.tsx
      TopBar.tsx               ← was components/TopBar.tsx
    state/
      actions.ts               ← was state/actions.ts
    utils/
      badges.ts                ← was utils/badges.ts
      highlight.ts             ← was utils/highlight.ts
      html.ts                  ← was utils/html.ts
      http-client.ts           ← was utils/http-client.ts
      resizable-panes.ts       ← was utils/resizable-panes.ts
  App.tsx                      (unchanged)
  mount.ts                     (unchanged)
  loader.ts                    (unchanged)
  main.tsx                     (unchanged)
  style.css                    (unchanged)
  vite-env.d.ts                (unchanged)
```

---

## Feature Ownership

| Feature      | Owns                                                           | Depends on               |
|--------------|----------------------------------------------------------------|--------------------------|
| `spec`       | OpenAPI types, parser, ref resolver, example gen, spec context | —                        |
| `nav`        | Sidebar, endpoint/schema detail views, nav context             | `spec`                   |
| `playground` | Try-it-out panel and all sub-components, playground context    | `spec`, `auth`, `server` |
| `auth`       | Auth modal, auth context                                       | `spec`                   |
| `server`     | Server chip + variable editor, server context                  | `spec`                   |
| `schema`     | Schema viewer and recursive node renderer                      | `spec`                   |
| `shared`     | Modal shell, load modal, command bar, top bar, actions, utils  | all features             |

### Why these groupings?

**`spec/` owns `openapi.ts`** — the types are inseparable from the parser; they co-evolve. Any file that imports
`openapi.ts` already imports parser output.

**`nav/` owns the detail pages** — `DetailPane`, `EndpointDetail`, `SchemaDetail` are rendered by the nav routing logic.
They are tightly coupled to `nav-context` (active endpoint/schema) and have no other consumers.

**`schema/` is separate from `nav/`** — `SchemaViewer` and `SchemaNode` are used by both `EndpointDetail` (response
schemas) and `SchemaDetail` (schema browser). They belong to neither nav nor playground exclusively.

**`shared/contexts/index.tsx`** — keeps the single barrel export for all contexts, so existing
`import { useSpec } from "../contexts"` patterns require only a path update, not a full rewrite.

**`shared/state/actions.ts`** — cross-feature operations (e.g. `applySpec` writes to spec + nav + playground contexts
simultaneously) cannot belong to any single feature. `shared/state/` is its natural home.

**`LoadModal` in `shared/components/`** — it triggers `loadSpecFromUrl`/`loadSpecFromFile` from
`shared/state/actions.ts` and uses `modal-context` from `shared/contexts/`. It has no feature-specific logic.

**`TopBar` and `CommandBar` in `shared/components/`** — both span multiple features (TopBar reads spec + auth + server;
CommandBar reads spec + nav + auth + modal). Neither belongs to one feature.

---

## Migration Plan

Each phase is independently committable and leaves the app in a working state.

### Phase 1 — Create folders, move files, fix imports

Move files to their new locations one feature at a time. Update all import paths. No logic changes.

**Order** (least-depended-on first):

1. `shared/utils/` ← `utils/*`
2. `shared/contexts/` ← `contexts/modal-context.tsx` + `contexts/index.tsx`
3. `features/spec/` ← `types/openapi.ts` + `parser/*` + `contexts/spec-context.tsx`
4. `features/auth/` ← `contexts/auth-context.tsx` + `components/AuthModal.tsx`
5. `features/server/` ← `contexts/server-context.tsx` + `components/ServerConfig.tsx`
6. `features/schema/` ← `components/SchemaViewer.tsx` + `components/SchemaNode.tsx`
7. `features/nav/` ← `contexts/nav-context.tsx` + `components/Nav.tsx` + `pages/*`
8. `features/playground/` ← `contexts/playground-context.tsx` + `components/Playground.tsx`
9. `shared/components/` ← `components/Modal.tsx` + `components/LoadModal.tsx` + `components/CommandBar.tsx` +
   `components/TopBar.tsx`
10. `shared/state/` ← `state/actions.ts`
11. Update `App.tsx` import paths

### Phase 2 — Verify

- `npm run typecheck` passes with zero errors
- `npm run build` and `npm run build:lib` produce identical output hashes
- Dev server loads all test specs from `public/specs/` without errors

### Phase 3 — CLAUDE.md update

Update the project structure section in `CLAUDE.md` to reflect the new layout.

---

## Import Path Examples

Before and after for common import patterns:

```ts
// spec types
-
import type {EndpointEntry} from "../types/openapi";

+
import type {EndpointEntry} from "../features/spec/openapi";

// context hooks
-
import {useSpec} from "../contexts";

+
import {useSpec} from "../shared/contexts";

// actions
-
import {selectEndpoint} from "../state/actions";

+
import {selectEndpoint} from "../shared/state/actions";

// parser utilities
-
import {resolveRef} from "../parser/ref-resolver";

+
import {resolveRef} from "../features/spec/ref-resolver";

// within playground (relative, unchanged depth)
-
import {usePlayground} from "../contexts/playground-context";

+
import {usePlayground} from "./playground-context";
```

> **Note:** Adding a `paths` alias in `tsconfig.json` (e.g. `@features/*`, `@shared/*`) would eliminate the relative
`../` chains entirely. Recommended as a follow-up but out of scope for this refactor.

---

## Risks

| Risk                                        | Likelihood | Mitigation                                                      |
|---------------------------------------------|------------|-----------------------------------------------------------------|
| Missed import path causing build failure    | Medium     | `npm run typecheck` catches all broken imports before shipping  |
| Circular imports between features           | Low        | Feature dependency graph is acyclic (see ownership table above) |
| Git history harder to follow across renames | Low        | Use `git mv` for each file so rename is tracked                 |
| CLAUDE.md goes stale                        | Medium     | Phase 3 explicitly requires updating it                         |

---

## Open Questions

| # | Question                                                                                                                                    |
|---|---------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Should `openapi.ts` stay in `features/spec/` or move to `shared/types/` since every feature imports it?                                     |
| 2 | Should we add `tsconfig.json` path aliases (`@features/`, `@shared/`) in the same PR or as a follow-up?                                     |
| 3 | Should `SchemaViewer`/`SchemaNode` live in `features/schema/` or `shared/components/` given they are used by both `nav/` and `playground/`? |