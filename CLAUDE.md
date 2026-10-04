# GrowthTrace: notes for coding agents

Monorepo (npm workspaces): `frontend/` (Next.js App Router), `backend/` (Fastify),
`packages/design-system/` (Aurora UI), `packages/config/` (shared TS/ESLint/Prettier/Stylelint).
Requirements live in [BRD.md](BRD.md) and [FRD.md](FRD.md).

## Before you finish

Run `npm run verify`. It is the single gate (format, lint, lint:styles, check:styles,
typecheck, unit tests, Playwright, knip) and must pass.

## Styling rule

**Styling rule.** All UI is built from `@growthtrace/design-system`. If a style you need
doesn't exist, add a token (to `tokens.css` and `tokens.ts`) or a component to the design
system first, show it on `/design`, and then use it. Never style a one-off: no arbitrary
Tailwind values, no `style={{}}`, no raw colours, no new CSS files, no inline animations.
Lint will reject them.

- `eslint-disable` comments cannot switch off the styling rules; allowlists live in
  `packages/config/eslint.config.js` and change only through review.
- See [packages/design-system/README.md](packages/design-system/README.md) for how to add a
  token or component.
