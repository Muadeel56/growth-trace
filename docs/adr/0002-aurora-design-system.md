# ADR 0002: Aurora, a single enforced in-repo design system

Status: Accepted
Date: 2026-10-08

## Context

GrowthTrace's UI is written by one human and several coding agents. Without a boundary, each contributor makes local styling choices (another grey, a 13px gap, a hand-rolled spinner), and within a few features the dashboard looks stitched together. Agents are especially prone to this: they produce plausible one-off Tailwind (`w-[37px]`, `text-gray-400`) that passes review in isolation.

We also have firm accessibility goals: WCAG AA contrast, visible focus, 44px tap targets and reduced motion. These are hard to guarantee page by page, but easy to guarantee once in shared building blocks.

## Decision

- **One in-repo design system**, `@growthtrace/design-system` ("Aurora", `packages/design-system/`), is the only source of styling. Feature code arranges its components and layout utilities and never styles them.
- **Tokens are the single source of values**, defined in `tokens.css` (a Tailwind v4 `@theme` block starting with `--*: initial`, which removes every default) and mirrored in `tokens.ts` for JavaScript. A unit test fails on drift, and another proves WCAG contrast for every text/background pair.
- **Tailwind is restricted to tokens.** Because the defaults are wiped, any class Aurora doesn't define is an unknown class.
- **Enforcement is mechanical**, not a convention: custom ESLint rules (`aurora/no-arbitrary-values`, `no-style-prop`, `no-raw-colors`, `no-inline-motion`, `no-css-imports`, `no-bare-z-index`, `no-off-scale-opacity`, `no-desktop-first`), `better-tailwindcss/no-unknown-classes`, Stylelint on the design-system CSS, and `check:styles` against stray stylesheets. `eslint-comments/no-restricted-disable` and `no-use` stop `eslint-disable` and inline config from switching these off.
- **Exceptions live in one reviewed allowlist** in `packages/config/eslint.config.js`.
- **`/design` is the living documentation.** Every token and component variant is shown there, and Playwright checks that page at every viewport.

## Alternatives considered

- **An off-the-shelf kit (shadcn/ui, MUI, Chakra).** Faster to start, but each still allows arbitrary styling around its components, and MUI/Chakra bring their own styling runtime and theme model. shadcn copies components into the repo, which is close to what we do, but provides no enforcement. We do use Radix primitives (via `radix-ui`) underneath Dialog and Tooltip for behaviour and accessibility.
- **Plain Tailwind with conventions and review.** Cheapest, but conventions don't survive agents generating code at volume, and review is the bottleneck we want to relieve.

## Consequences

- Changing how something looks always starts in the design system: add a token or component, show it on `/design`, then use it. This is slower for the first use of a new pattern, and faster for every use after.
- The allowlist changes only through review, with a reason in the PR. Today it covers `AuroraBackground` and charts (inline `style`), tokens (raw colours), motion presets (inline Motion objects) and the root layout's stylesheet import.
- Lint failures are the main feedback loop for agents. The rule messages say what to use instead.
- The `/design` page and its Playwright checks double as the design system's test suite and its documentation. See [docs/design-system/](../design-system/principles.md).
