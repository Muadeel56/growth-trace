<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend rules

These add to the root [AGENTS.md](../AGENTS.md); they don't repeat it.

- **Aurora only.** Every class comes from the Aurora theme, every component from `@growthtrace/design-system`. Missing a style? Add the token or component in `packages/design-system`, show it on `/design`, then use it here.
- **Layout.** App Router pages live in `src/app/` (`page.tsx` is the dashboard, `design/` is the Aurora catalogue, `nav.tsx` the shared nav). Data access goes through `src/lib/api.ts`; sample data until real data lands is in `src/lib/sample-data.ts`.
- **States.** Every new UI state (loading, empty, error) is shown on `/design`, and every new route is added to `routes` in `e2e/viewports.ts` so it gets the responsive and axe checks at every width.
