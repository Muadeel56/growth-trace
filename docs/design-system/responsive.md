# Responsive and accessibility check

Every page must work from a 320px phone to a 3840px display, in Chromium, WebKit and Firefox, with no axe violations. The authoring rules (mobile-first, fluid type, container queries, touch targets) are in the package README's [Responsive rules](../../packages/design-system/README.md#responsive-rules). This page covers the automated check that enforces them.

## Viewports

`e2e/viewports.ts` defines the matrix. Every spec loops over it.

| Name                    | Size        | Touch layout (44px targets) | Notes         |
| ----------------------- | ----------- | --------------------------- | ------------- |
| `xs-320`                | 320 × 640   | yes                         | axe locally   |
| `phone-375`             | 375 × 812   | yes                         | axe locally   |
| `phone-414`             | 414 × 896   | yes                         |               |
| `tablet-768-portrait`   | 768 × 1024  | yes                         | axe locally   |
| `tablet-1024-landscape` | 1024 × 768  | no                          |               |
| `laptop-1024`           | 1024 × 768  | no                          |               |
| `laptop-1280`           | 1280 × 800  | no                          |               |
| `desktop-1440`          | 1440 × 900  | no                          | axe locally   |
| `desktop-1920`          | 1920 × 1080 | no                          |               |
| `qhd-2560`              | 2560 × 1440 | no                          | Chromium only |
| `uhd-3840`              | 3840 × 2160 | no                          | Chromium only |

Axe costs about 7s per page, so local runs (pre-commit, `verify`) run it only on the rows marked `axe`, one per distinct layout. CI runs it at every width.

## What fails the check

`e2e/responsive.spec.ts` loads every route in `routes` at every viewport and fails on:

- **Horizontal page scroll**, or any element sticking out past the viewport.
- **Clipped text**: text cut off by an `overflow: hidden` box. An ellipsis with a `title` attribute is allowed.
- **Small tap targets**: interactive elements under 44×44px on touch rows (≤ 768px).
- **Charts** (`[data-chart]`) wider than their container.
- **Tables**: a `DataTable` showing the wrong mode for the width (cards below `md`, `<table>` from `md`).
- **Accessibility**: any axe violation (WCAG 2.0/2.1/2.2 A and AA).
- **Screenshots** (only when `PW_VISUAL=1`, i.e. CI and the Docker update script): a diff over 1% against `e2e/__screenshots__/<browser>/`.

Other specs: `app-shell.spec.ts` (sidebar vs. tab bar, skip link), `design.spec.ts` (`/design` with and without reduced motion) and `focus-ring.spec.ts` (ring drawn on every surface).

### `data-tap-exempt`

A few composite widgets can't have 44px cells but offer a larger alternative. Mark the element `data-tap-exempt="<reason>"`. The reason is required, and an empty value fails the check. Every exemption must be listed in the package README's tap-target exemptions, so review sees it. Today there is one: `ActivityHeatmap` cells (`composite-grid`). Links inside running text (`p a`) are exempt automatically (WCAG 2.5.8 inline exception).

## Adding a route

Add the path to `routes` in `e2e/viewports.ts`. It then gets every check at every width in all three browsers. Then generate its screenshot baselines (below) and commit them with the page.

If the page fetches data, add a fixture for each endpoint (see [testing](../development/testing.md#the-stub-api-and-fixtures)). The stub API answers 501 to anything without one.

## Where it runs

- **Pre-commit:** `npm run test:responsive` (Chromium) when the commit stages anything under `frontend/`, `packages/design-system/` or `e2e/`. Other commits skip it.
- **`npm run verify`:** Chromium.
- **CI** (`.github/workflows/ci.yml`): the `responsive` job, once per browser inside the Playwright Docker image, with `PW_VISUAL=1`. Failed runs upload `playwright-report/` and `test-results/` (including screenshot diffs) as artifacts.

## Updating screenshot baselines

Fonts render differently on every OS, so baselines are only ever generated in the Playwright Docker image, pinned to the same version as `@playwright/test` (`mcr.microsoft.com/playwright:v1.63.0-noble`). Local runs skip the screenshot assertion; it runs only when `PW_VISUAL=1`, which the Docker script and CI set.

```sh
npm run test:responsive:update   # all 3 browsers; writes e2e/__screenshots__/
```

Review the changed PNGs, then commit them with the UI change. When you bump `@playwright/test`, bump the image tag in `package.json` and `.github/workflows/ci.yml` too, then regenerate.
