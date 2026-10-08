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
| Type        | `text-display`, `text-h1`…`text-caption`, `font-sans`, `font-semibold`         | Each size carries its line-height and weight. Display, h1, h2 are fluid (`clamp`).   |
| Spacing     | `p-4`, `gap-2`, `size-12`… (steps 0–4, 6, 8, 10, 12, 16, 20, 24), `size-touch` | 4px base. No `--spacing` multiplier, so off-scale steps don't exist. `touch` = 44px. |
| Widths      | `w-sidebar`, `max-w-prose`, `max-w-page`, `max-w-2xs/xs/sm/md/lg`              | `--container-*`. Also the container-query sizes: `@2xs:`, `@xs:`, `@sm:`…            |
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
4. Build it mobile-first and touch-sized (see [Responsive rules](#responsive-rules)).
5. Add every variant and state to `/design`. Playwright checks every route at every width
   from 320px to 3840px (`e2e/viewports.ts`): no sideways scroll, nothing sticking out or
   clipped, 44px tap targets on touch layouts, charts that fit, and zero axe violations.

## Responsive rules

- **Mobile-first.** Base classes style the phone layout; `sm:`, `md:`, `lg:`… add to it.
  `max-*` variants (`max-md:`, `@max-sm:`) are banned by `aurora/no-desktop-first`.
- **Fluid headings.** `text-display`, `text-h1` and `text-h2` use `clamp(min, rem + vw, max)`,
  so they shrink on phones without breakpoints. The `rem` part keeps browser zoom working
  (WCAG 1.4.4). `text-h3` and smaller are fixed.
- **Container queries.** `Panel` is a query container (`@container`) by default, so its
  children adapt to the panel's width with `@2xs:` (16rem), `@xs:` (20rem), `@sm:` (24rem),
  `@md:`, `@lg:`… An element can't query itself, so `Panel`'s own padding stays
  viewport-based. Pass `container={false}` when a panel sits inside a content-sized parent
  (`w-max`, `inline-flex`): `container-type: inline-size` would collapse it to zero width.
  `StatTile` is the reference example: it stacks in narrow slots and goes to one row from `@xs`.
- **Touch targets.** On touch layouts (below `lg`, i.e. phones and portrait tablets) every
  interactive element is at least 44×44px: use `min-h-touch`, `min-w-touch` or `size-touch`,
  and go compact from `lg:` up (`Button` and `Input` do this). Icon-only buttons such as the
  `Dialog` and `Toast` close buttons are `size-touch` with a 16px icon.
- **Tap-target exemptions.** Only for composite widgets where 44px cells are impossible and a
  larger alternative exists. Mark the element `data-tap-exempt="<reason>"` (the reason is
  required; the check fails on an empty value) and list it here:
  - `ActivityHeatmap` cells, `composite-grid`: the grid is one tab stop with roving focus
    (arrow keys), and the summary text above it carries the same information.

  Links inside running text (`p a`) are exempt automatically (WCAG 2.5.8 inline exception).

- **Charts** mark their root `data-chart` and must fit their container. Wide charts scroll
  inside their own `overflow-x-auto` box (`ActivityHeatmap` starts scrolled to the latest week).
- **Tables** use `DataTable`: a semantic `<table>` from `md` up and a list of cards (one `<dl>`
  per row) below `md`. Only one is in the accessibility tree at a time.

## Enforcement

| Check                                   | Catches                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| `better-tailwindcss/no-unknown-classes` | Any class the Aurora theme doesn't generate (`bg-red-500`, `p-37`, `rounded-3xl`). |
| `aurora/no-arbitrary-values`            | `w-[37px]`, `bg-[#f00]`, `[mask-type:alpha]`, `p-(--x)`, `bg-accent-from/[0.37]`.  |
| `aurora/no-off-scale-opacity`           | `bg-surface/37`, `opacity-37`: only the `--opacity-*` steps from tokens.css.       |
| `aurora/no-bare-z-index`                | `z-50` and other numeric layers.                                                   |
| `aurora/no-desktop-first`               | `max-md:hidden`, `@max-sm:grid-cols-1`: desktop-first (max-width) variants.        |
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
