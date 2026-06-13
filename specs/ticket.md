# Issue Template

API Explorer is a web-based, embeddable OpenAPI 3.x UI — a lightweight open source alternative to Swagger UI.
Use this file as the canonical template when writing GitHub issues for this project.
Copy the relevant section below into a new issue and fill in the brackets.

---

## Bug Report

**Title**: `[Bug] <short description>`

**Describe the bug**
A clear and concise description of what the bug is.

**Steps to reproduce**

1. Load a spec (URL or file upload)
2. Navigate to '...'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened. Include error messages, stack traces, or screenshots if applicable.

**Spec details** *(if relevant)*

- Does the bug reproduce with any OpenAPI 3.x spec, or only specific ones?
- Can you share a minimal spec that reproduces the issue? (strip any sensitive data)
- Are any `$ref`s, `oneOf`/`anyOf`/`allOf`, or response/parameter references involved?

**Environment**

- Embed method: [CDN via jsDelivr / `mountApiExplorer` in own bundle / dev server]
- Browser: [e.g. Chrome 124, Firefox 125, Safari 17]
- OS: [e.g. macOS 14, Ubuntu 22.04]
- Version / commit: [e.g. v1.2.0 or git SHA]

**Additional context**
Any other context, console errors, or network logs that help reproduce the issue.

---

## Feature Request

**Title**: `[Feature] <short description>`

**Problem / motivation**
What problem does this solve? Why is the current behavior insufficient?
If you're migrating from Swagger UI or Redoc, describe what you relied on there.

**Proposed solution**
A clear description of what you want to happen.

**OpenAPI spec relevance**
Which part of the OpenAPI 3.x spec does this relate to?
(e.g. request body, response schema rendering, `$ref` resolution, `securitySchemes`, server variables, etc.)

**Alternatives considered**
Other approaches you evaluated and why you ruled them out.

**Additional context**
Mockups, links to the OpenAPI spec, links to prior art in Swagger UI / Redoc, or related issues.

---

## Chore / Refactor

**Title**: `[Chore] <short description>`

**What and why**
Describe the work and the motivation (e.g. dependency update, bundle size, test coverage, accessibility, cleanup).

**Scope**
List the files or areas of the codebase affected (e.g. `features/spec/`, `shared/state/actions.ts`, build config).

**Definition of done**
Bullet list of acceptance criteria — what does "complete" look like?

---

## Labels

Attach one or more labels to every issue:

| Label              | When to use                                                      |
|--------------------|------------------------------------------------------------------|
| `bug`              | Something is broken or behaves incorrectly                       |
| `feature`          | New capability or user-visible improvement                       |
| `spec-rendering`   | Issues with how OpenAPI schemas, refs, or examples are displayed |
| `playground`       | Issues with the Try-it-out / request execution panel             |
| `auth`             | Auth schemes, credential handling, security definitions          |
| `embed`            | `mountApiExplorer`, CDN loader, or host-page integration         |
| `chore`            | Maintenance, deps, refactor, CI — no new behavior                |
| `docs`             | Documentation only                                               |
| `good first issue` | Well-scoped, low risk, suitable for new contributors             |
| `help wanted`      | Open to external contribution                                    |
| `blocked`          | Cannot proceed until another issue or PR is resolved             |
| `wontfix`          | Acknowledged but will not be addressed                           |