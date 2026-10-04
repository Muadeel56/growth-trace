# @growthtrace/design-system (Aurora)

The only source of styling in GrowthTrace. Feature code arranges these components; it
never styles them. Lint, Stylelint and a stray-stylesheet check enforce this, so styling
outside the system fails `npm run verify`.

```ts
import { Button, Panel, StatTile } from '@growthtrace/design-system';
import { tokens } from '@growthtrace/design-system/tokens'; // charts, Motion, /design
// frontend/src/app/layout.tsx is the one place that imports the stylesheet:
import '@growthtrace/design-system/styles.css';
```

Browse everything at **`/design`** (`npm run dev -w @growthtrace/frontend`, then open
http://localhost:3000/design). The route returns 404 in production unless
`NEXT_PUBLIC_ENABLE_DESIGN_ROUTE=1`.

## Tokens

`src/tokens/tokens.css` defines every token in a Tailwind v4 `@theme` block that starts
with `--*: initial`, which wipes all Tailwind defaults. Only Aurora tokens generate classes,
so `bg-red-500`, `p-37`, `rounded-3xl` and `shadow-2xl` don't exist.

| Group       | Classes                                                                        | Notes                                                                                |
| ----------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Colour      | `bg-surface`, `text-muted`, `border-border`, `bg-accent-gradient`…             | OKLCH. Dark-first; a light theme would redefine the same names under `[data-theme]`. |
| Type        | `text-display`, `text-h1`…`text-caption`, `font-sans`, `font-semibold`         | Each size carries its line-height and weight.                                        |
| Spacing     | `p-4`, `gap-2`, `size-12`… (steps 0–4, 6, 8, 10, 12, 16, 20, 24)               | 4px base. No `--spacing` multiplier, so off-scale steps don't exist.                 |
| Widths      | `w-sidebar`, `max-w-prose`, `max-w-page`, `max-w-md`, `max-w-lg`               | `--container-*`.                                                                     |
| Opacity     | `opacity-50`, `bg-surface/80` (steps 0, 10, 20 … 100)                          | Only these steps; `/37` or `opacity-37` fail lint.                                   |
| Radii       | `rounded-sm/md/lg/full`                                                        |                                                                                      |
| Elevation   | `shadow-glow-sm/md/accent`, `backdrop-blur-sm/md`, `blur-aurora`               | Glows, not drop shadows.                                                             |
| Motion      | `duration-fast/base/slow`, `ease-out-expo/spring`, `animate-*`                 | Wrap CSS animations in `motion-ok:` so they stop for reduced motion.                 |
| Breakpoints | `xs: sm: md: lg: xl: 2xl:`                                                     | 360 / 640 / 768 / 1024 / 1280 / 1536px.                                              |
| Z-index     | `z-base`, `z-raised`, `z-nav`, `z-overlay`, `z-dialog`, `z-toast`, `z-tooltip` | Custom utilities; bare `z-50` is banned.                                             |

`src/tokens/tokens.ts` mirrors the CSS for JavaScript (charts, Motion presets, `/design`).

### Adding a token

1. Add it to `tokens.css` (inside `@theme`, or `:root` for non-Tailwind values like z-layers).
2. Add the same name and value to `tokens.ts`. `tokens.test.ts` fails if the two drift.
3. If it's a text or background colour, add the pair to `contrast.test.ts` (must be ≥ 4.5:1;
   the focus ring must stay ≥ 3:1 against every surface).
4. If it's a new group or name, teach `lib/cn.ts` (tailwind-merge) about it.
5. Show it on `/design` (`frontend/src/app/design/page.tsx`). The `Record<…>` maps there
   fail typecheck until the token is shown.

### Adding a component

1. Put it in `src/components/` (charts in `src/charts/`) and export it from `src/index.ts`.
2. Build classes with `cva` and `cn()`; never concatenate class strings.
3. Interactive elements use `focusRing` (a Playwright test checks it renders on `bg`,
   `surface` and `surface-raised`). Animations come from `src/motion/presets.ts` or
   `motion-ok:` CSS animations, so reduced motion is respected.
4. Add every variant and state to `/design`. Playwright runs axe and a no-horizontal-scroll
   check there at 375, 768 and 1440px, with and without reduced motion.

## Enforcement

| Check                                   | Catches                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| `better-tailwindcss/no-unknown-classes` | Any class the Aurora theme doesn't generate (`bg-red-500`, `p-37`, `rounded-3xl`). |
| `aurora/no-arbitrary-values`            | `w-[37px]`, `bg-[#f00]`, `[mask-type:alpha]`, `p-(--x)`, `bg-accent-from/[0.37]`.  |
| `aurora/no-off-scale-opacity`           | `bg-surface/37`, `opacity-37`: only the `--opacity-*` steps from tokens.css.       |
| `aurora/no-bare-z-index`                | `z-50` and other numeric layers.                                                   |
| `aurora/no-style-prop`                  | `style={{…}}`.                                                                     |
| `aurora/no-raw-colors`                  | `'#ff0000'`, `rgb(`, `hsl(`, `oklch(`… in `.tsx`.                                  |
| `aurora/no-inline-motion`               | `animate={{…}}`, `transition={{…}}` and other inline Motion objects.               |
| `aurora/no-css-imports`                 | Stylesheet imports outside this package.                                           |
| `eslint-comments/no-restricted-disable` | `eslint-disable` comments targeting any of the above.                              |
| `npm run lint:styles` (Stylelint)       | Raw colours, sizes, radii, shadows, z-indexes and durations in this package's CSS. |
| `npm run check:styles`                  | Any `.css/.scss/.sass/.less` file outside `packages/design-system/`.               |

The rules live in `packages/config/eslint-rules/` and `packages/config/eslint.config.js`;
`packages/config/test/enforcement.test.ts` proves each one fires.

### Allowlist policy

Exceptions live only in `packages/config/eslint.config.js`, so every one is reviewed:

- `style` prop: `AuroraBackground.tsx` (per-layer animation phase) and `src/charts/**`.
- Raw colours: `src/tokens/**`.
- Inline Motion objects: `src/motion/**`.
- Stylesheet imports: this package, plus the single `@growthtrace/design-system/styles.css`
  import in `frontend/src/app/layout.tsx`.

Add to the list only when a token or component can't express the need, and say why in the PR.
