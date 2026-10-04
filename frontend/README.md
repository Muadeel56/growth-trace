# GrowthTrace Dashboard

Next.js (App Router) frontend. Product pages land in later phases; see
[../BRD.md](../BRD.md) and [../FRD.md](../FRD.md).

```bash
npm run dev -w @growthtrace/frontend   # http://localhost:3000
```

- `/` is a placeholder dashboard that exercises `AppShell` with sample data.
- `/design` is the Aurora living style guide (dev only, or set
  `NEXT_PUBLIC_ENABLE_DESIGN_ROUTE=1` in production).

All UI comes from [`@growthtrace/design-system`](../packages/design-system/README.md).
`src/app/layout.tsx` imports its stylesheet once; no other CSS is allowed in this app, and
lint rejects arbitrary Tailwind values, `style={{}}`, raw colours and inline animations.
