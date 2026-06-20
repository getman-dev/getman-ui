# Feature Spec: Testing Strategy

## Goal

Establish a testing approach for the API Explorer that catches regressions in parsing, rendering, and interactive
behavior — without introducing a maintenance burden that slows down iteration on a small project.

## Background

The project currently has zero tests. The main sources of complexity are:

- **Pure parsing logic** — `spec-parser.ts`, `ref-resolver.ts`, and `example-gen.ts` implement non-trivial algorithms (
  ref resolution, parameter merging, example generation) that are already encoding many edge cases silently.
- **React components** — Mostly presentational or context-driven. The most complex are `Nav.tsx`, `EndpointDetail.tsx`,
  `Playground.tsx`, and `SchemaNode.tsx` (recursive).
- **Cross-context actions** — `shared/state/actions.ts` orchestrates state mutations across multiple contexts (eager
  snapshot pattern). Bugs here tend to cascade.
- **Mount function** — `launch` is the public API surface; regressions here affect all embedders.

The tech stack is Vite + React 19 + TypeScript. No test runner is installed.

## Constraints

- Keep test setup lightweight — this is a solo/small-team project, not a platform.
- Tests must run in CI without a real browser (or that requirement must be explicit).
- Adding tests should not require rewriting production code structure.
- TypeScript strict mode must be satisfied in test files too.

---

## Approach A — Unit Tests Only (Vitest)

### Summary

Install Vitest and write tests exclusively for pure functions: the spec parser, ref resolver, example generator, and
utility modules. No DOM, no React.

### How it works

```bash
npm install -D vitest
```

```ts
// vite.config.ts — add test block
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'node',
    },
})
```

```ts
// src/features/spec/spec-parser.test.ts
import {describe, it, expect} from 'vitest'
import {parseSpec} from './spec-parser'

describe('parseSpec', () => {
    it('groups endpoints by tag', () => {
        const spec = { /* minimal OpenAPI */}
        const groups = parseSpec(spec)
        expect(groups[0].name).toBe('pets')
        expect(groups[0].endpoints).toHaveLength(2)
    })

    it('operation-level param wins over path-level param with same name+in', () => {
        // ...
    })
})
```

**Files with the highest test ROI:**

| File                            | Why                                                               |
|---------------------------------|-------------------------------------------------------------------|
| `features/spec/spec-parser.ts`  | Parameter merging, tag grouping, edge-case ordering               |
| `features/spec/ref-resolver.ts` | `$ref` resolution, circular ref handling, missing refs            |
| `features/spec/example-gen.ts`  | `schemaToExample`, `buildUrl`, `resolveServerUrl` — branchy logic |
| `shared/utils/html.ts`          | `escapeHtml` — security-relevant                                  |
| `shared/utils/badges.ts`        | Method → CSS class mapping                                        |
| `shared/utils/highlight.ts`     | JSON highlighter — size-limit behavior                            |

### Work items

1. **Install Vitest** — add `vitest` to devDependencies, add `test` block to `vite.config.ts`, add `"test": "vitest"`
   script to `package.json`.
2. **Write `spec-parser` tests** — cover tag grouping, parameter merging (operation wins on name+in conflict), untagged
   endpoints, empty spec.
3. **Write `ref-resolver` tests** — cover `$ref` to components/schemas, nested refs, missing ref (error case), circular
   ref guard.
4. **Write `example-gen` tests** — cover `schemaToExample` for primitives, objects, arrays, `allOf`/`oneOf`; `buildUrl`
   with path params; `resolveServerUrl` with variables.
5. **Write utility tests** — `escapeHtml` (XSS chars), `methodBadgeClasses` (all HTTP verbs), `highlightJson` (large
   payload truncation).
6. **Add `typecheck` + `test` to CI** — run both in the same pipeline step.

### Pros

- Vitest is the natural fit for Vite — shares config, same ESM model, no transpilation quirks.
- Pure-function tests have zero flakiness and run in milliseconds.
- The parsing/resolution logic is the riskiest code in the project — tests here give the highest regression protection
  per line of test code.
- No DOM, no React, no browser binary required.
- Easy to add incrementally alongside feature work.

### Cons

- Does not cover rendering behavior, component interactions, or visual regressions.
- A bug in how a component reads from context won't be caught.
- Does not test the `launch` public API end-to-end.

---

## Approach B — Unit + Component Tests (Vitest + React Testing Library)

### Summary

Extend Approach A with component-level tests using `@testing-library/react`. Tests render components into a JSDOM
environment and assert on what the user would see and interact with.

### How it works

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

```ts
// vite.config.ts
test: {
    environment: 'jsdom',
        setupFiles
:
    ['./src/test-setup.ts'],
}
```

```ts
// src/test-setup.ts
import '@testing-library/jest-dom'
```

```tsx
// src/features/nav/Nav.test.tsx
import {render, screen} from '@testing-library/react'
import {Nav} from './Nav'
import {mockSpecContext} from '../spec/test-utils'

it('renders endpoint list grouped by tag', () => {
    render(
        <SpecProvider value={mockSpecContext({ /* petstore */})}>
            <Nav/>
        </SpecProvider>
    )
    expect(screen.getByText('GET /pets')).toBeInTheDocument()
})
```

**Components with the highest test ROI:**

| Component            | What to test                                                         |
|----------------------|----------------------------------------------------------------------|
| `Nav.tsx`            | Search filtering, endpoint list rendering, tab switching             |
| `SchemaNode.tsx`     | Recursive rendering, `$ref` expansion, object/array variants         |
| `EndpointDetail.tsx` | Parameter list, required badge, response accordion                   |
| `Playground.tsx`     | Form fills, request firing (mock `executeRequest`), response display |

### Work items

1. **Complete Approach A** — unit tests are a prerequisite.
2. **Install RTL + jsdom** — `@testing-library/react`, `@testing-library/user-event`, `jsdom`,
   `@testing-library/jest-dom`.
3. **Write context test utilities** — factory functions (`mockNavContext`, `mockSpecContext`, etc.) that produce context
   values for test renders.
4. **Write `Nav` tests** — search input narrows endpoint list, tag group collapses, schema tab shows schemas.
5. **Write `SchemaNode` tests** — object with nested properties, `$ref` resolves to inline rendering, `oneOf` picks
   correct variant.
6. **Write `EndpointDetail` tests** — required params marked, response codes listed, body schema shown.
7. **Write `Playground` tests** — mock `executeRequest`, assert request is built correctly from form values.

### Pros

- Catches rendering bugs and context-wiring bugs that unit tests miss.
- RTL's philosophy of testing what the user sees reduces coupling to implementation details.
- JSDOM is fast — no real browser needed.
- Components are already well-structured (context-driven) so wrapping them for tests is clean.

### Cons

- JSDOM has known gaps: no layout engine, limited CSS support — tests can't assert on visual layout or Tailwind-applied
  styles.
- Context test utilities require upfront investment and must be kept in sync with context shape changes.
- Component tests are more brittle than unit tests — they break when rendering structure changes, even without
  behavioral regressions.
- `@testing-library/jest-dom` matchers need a global setup step (non-obvious for new contributors).

---

## Approach C — E2E Tests Only (Playwright)

### Summary

Install Playwright and test complete user flows in a real browser against the running Vite dev server (or a built
preview). No unit or component tests.

### How it works

```bash
npm init playwright@latest
```

```ts
// playwright.config.ts
import {defineConfig} from '@playwright/test'

export default defineConfig({
    testDir: './e2e',
    webServer: {
        command: 'npm run dev',
        port: 5173,
        reuseExistingServer: !process.env.CI,
    },
    use: {baseURL: 'http://localhost:5173'},
})
```

```ts
// e2e/nav.spec.ts
import {test, expect} from '@playwright/test'

test('user can navigate to an endpoint and see its details', async ({page}) => {
    await page.goto('/')
    await page.getByText('GET /pets').click()
    await expect(page.getByRole('heading', {name: 'List all pets'})).toBeVisible()
})

test('search narrows the endpoint list', async ({page}) => {
    await page.goto('/')
    await page.getByPlaceholder('Search').fill('pet')
    await expect(page.getByText('DELETE /pets/{id}')).not.toBeVisible()
})
```

**Critical flows to cover:**

- Load a spec from URL via the load modal.
- Navigate to an endpoint and read its parameters and responses.
- Use the Playground: fill a param, execute, see the response.
- Auth modal: set an API key, verify it appears in the executed request header.
- Hash routing: `/` → click endpoint → URL updates → refresh → same endpoint active.

### Work items

1. **Install Playwright** — `npm init playwright@latest`, choose Chromium only for CI speed.
2. **Configure `webServer`** — point at Vite dev server, set `reuseExistingServer` for local dev.
3. **Place a test spec** — check in `specs/petstore.json` (or a minimal custom spec) in the project; configure
   `vite.config.ts` to serve it.
4. **Write navigation tests** — load spec, click endpoints, verify heading and param list.
5. **Write Playground tests** — fill path param, mock or allow the network call, assert response panel appears.
6. **Write hash-routing tests** — navigate to endpoint, reload, assert same endpoint active.
7. **Add Playwright CI step** — `playwright install --with-deps chromium` + `playwright test`.

### Pros

- Tests what actually ships — real browser, real DOM, real CSS, real fetch.
- Catches integration bugs (context wiring, hash routing, mount function) that unit/component tests can't.
- Playwright has excellent TypeScript support, parallel execution, trace viewer for debugging.
- No test utilities or context mocking needed — tests interact through the real UI.

### Cons

- Slowest feedback loop — a full E2E run takes seconds to minutes, not milliseconds.
- Flakiness risk from timing (network mocks, animation timing, race conditions in async state).
- Requires a browser binary in CI (adds ~300 MB to CI setup, ~30–60s to install step).
- Does not localize failures well — a failing E2E test might be caused anywhere in the stack.
- Without unit tests, subtle parser bugs (e.g., wrong parameter merging) may not be caught unless there's an E2E test
  that happens to exercise that specific edge case.

---

## Approach D — Full Pyramid (A + B + C)

### Summary

Implement all three layers: Vitest unit tests for parsing logic, RTL component tests for key UI behaviors, and
Playwright E2E tests for critical user flows.

### How it works

All three setups coexist. The test command runs Vitest (unit + component) locally and in CI; Playwright runs separately
in CI on a dedicated job.

```json
// package.json scripts
"test":        "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"typecheck": "tsc --noEmit"
```

CI runs `typecheck`, `test`, and `test:e2e` as separate steps (or jobs).

### Work items

All items from Approach A + B + C.

### Pros

- Maximum confidence at all levels of the stack.
- Fast feedback locally (unit/component) and comprehensive feedback in CI (E2E).
- Industry-standard pyramid: many cheap unit tests, fewer component tests, few E2E tests.

### Cons

- Highest setup investment — three frameworks, multiple config files, CI matrix.
- Context mock utilities must be maintained alongside both unit and component tests.
- On a small team, maintaining three test layers competes with feature work.
- Risk of over-testing: testing the same behavior at multiple levels without adding coverage.

---

## Comparison Matrix

|                                  | A: Unit (Vitest) | B: Unit + Component | C: E2E (Playwright) | D: Full Pyramid  |
|----------------------------------|:----------------:|:-------------------:|:-------------------:|:----------------:|
| Setup effort                     |       Low        |       Medium        |       Medium        |       High       |
| Feedback speed                   |  Fastest (~ms)   |    Fast (~ms–s)     |    Slow (~s–min)    | All of the above |
| Catches parser/logic bugs        |      ✅ Best      |          ✅          |   ❌ Incidentally    |        ✅         |
| Catches component rendering bugs |        ❌         |          ✅          |          ✅          |        ✅         |
| Catches routing / mount bugs     |        ❌         |          ❌          |       ✅ Best        |        ✅         |
| Requires browser in CI           |        ❌         |          ❌          |          ✅          |        ✅         |
| Flakiness risk                   |       None       |      Very low       |       Medium        |      Medium      |
| Tests real CSS / layout          |        ❌         |          ❌          |          ✅          |        ✅         |
| Maintenance burden               |       Low        |       Medium        |       Medium        |       High       |

---

## Recommendation

**Start with Approach A (unit tests), plan to add Approach C (E2E) for the 3–4 highest-value flows.**

### Why A first

The parsing and resolution logic (`spec-parser`, `ref-resolver`, `example-gen`) is the most complex, most brittle, and
least visible code in the project. It has no type-level safety against wrong OpenAPI structures — only runtime behavior.
A handful of unit tests here would have caught several classes of bugs that are currently discovered only by manually
loading a tricky spec.

Vitest requires one config change and one new `devDependency`. The first useful tests can be written in an afternoon.

### Why not component tests yet

The React components are mostly context-wired presentational layers. Without stability in the context shape (which may
still change as new features are added), component test utilities are likely to require frequent updates. Defer until
the context APIs settle.

### E2E as a second phase

Once unit tests cover the parsing layer, add 4–5 Playwright tests for:

1. Load spec from URL (the load modal flow).
2. Navigate to an endpoint and view its parameters.
3. Execute a request in the Playground and see the response.
4. Hash routing persistence on reload.
5. Auth modal: set API key, verify it's sent in the request.

These five tests give broad regression coverage at the user-visible level without maintaining a large suite.

### Skip for now

- Visual regression tests (Chromatic, Percy) — too much infra for current project scale.
- Component tests (RTL) — defer until context APIs are stable.
- Mutation testing — premature at zero test coverage.