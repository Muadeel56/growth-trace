# Tokens

Every visual value in GrowthTrace is a token. Tokens are defined twice, and `tokens.test.ts` fails if the two copies drift:

- `packages/design-system/src/tokens/tokens.css`: a Tailwind v4 `@theme` block that starts with `--*: initial`. That line wipes every Tailwind default, so **only Aurora tokens generate classes**. `bg-red-500`, `p-37`, `rounded-3xl` and `shadow-2xl` simply don't exist.
- `packages/design-system/src/tokens/tokens.ts`: the same names and values for JavaScript (charts, Motion presets, the `/design` page), imported from `@growthtrace/design-system/tokens`.

To add one, follow [Adding a token](../../packages/design-system/README.md#adding-a-token). Every group is shown on `/design`.

## Groups and naming

A token named `<name>` in group `<group>` becomes the CSS variable `--<prefix><name>` and the matching Tailwind classes.

| Group       | CSS variable                              | Example classes                                                                | Notes                                                                                                        |
| ----------- | ----------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Colour      | `--color-*`                               | `bg-surface`, `text-muted`, `border-border`, `bg-accent-gradient`              | OKLCH. Semantic names (`surface`, `danger-subtle`), never hue names                                          |
| Type        | `--text-*`, `--font-*`                    | `text-display`, `text-h1` … `text-caption`, `font-sans`, `font-semibold`       | Each size carries its line-height and weight. `display`, `h1`, `h2` are fluid (`clamp`)                      |
| Spacing     | `--spacing-*`                             | `p-4`, `gap-2`, `size-12`, `min-h-touch`                                       | 4px base, steps 0–4, 6, 8, 10, 12, 16, 20, 24. No multiplier, so off-scale steps don't exist. `touch` = 44px |
| Widths      | `--container-*`                           | `w-sidebar`, `max-w-prose`, `max-w-page`, `@xs:` container queries             | Also the container-query sizes `2xs` (16rem), `xs` (20rem), `sm` (24rem) …                                   |
| Opacity     | `--opacity-*`                             | `opacity-50`, `bg-surface/80`                                                  | Steps of 10 only; `/37` fails lint                                                                           |
| Radii       | `--radius-*`                              | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`                       |                                                                                                              |
| Elevation   | `--shadow-*`, `--blur-*`                  | `shadow-glow-sm/md/accent`, `backdrop-blur-sm/md`, `blur-aurora`               | Glows built with `color-mix` from the accent tokens, not drop shadows                                        |
| Motion      | `--duration-*`, `--ease-*`, `--animate-*` | `duration-fast/base/slow`, `ease-out-expo`, `ease-spring`, `animate-shimmer`   | Wrap CSS animations in `motion-ok:`; see [motion](motion.md)                                                 |
| Breakpoints | `--breakpoint-*`                          | `xs:` `sm:` `md:` `lg:` `xl:` `2xl:`                                           | 360 / 640 / 768 / 1024 / 1280 / 1536px                                                                       |
| Z-index     | `--z-*`                                   | `z-base`, `z-raised`, `z-nav`, `z-overlay`, `z-dialog`, `z-toast`, `z-tooltip` | Custom utilities in `styles.css`; bare `z-50` is banned                                                      |
| Safe area   | `--safe-area-*`                           | `pb-safe`                                                                      | iOS home-indicator padding under the bottom tab bar                                                          |

### Colour roles

| Role                    | Tokens                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Page and surfaces       | `bg` → `surface` → `surface-raised`, outlined with `border`                          |
| Text                    | `text`, `text-muted`                                                                 |
| Accent (brand gradient) | `accent-from`, `accent-to`, `accent-subtle`; text on it: `on-accent`                 |
| Status                  | `success`, `warning`, `danger` + a `*-subtle` fill each; text on danger: `on-danger` |
| Decorative              | `aurora-1` … `aurora-4` (the `AuroraBackground` fields)                              |
| Data                    | `heat-0` … `heat-4` (the `ActivityHeatmap` scale)                                    |

In JavaScript, use the helpers in `tokens.ts` instead of parsing values: `seconds('base')` turns a duration into Motion's seconds, and `bezier('out-expo')` turns an easing into a cubic-bezier tuple.

## Contrast guarantees

`src/tokens/contrast.ts` computes the WCAG contrast ratio between two colour tokens (using `culori`). `contrast.test.ts` asserts:

- **≥ 4.5:1 (WCAG AA text)** for every text/background pair the components render: body and muted text on `bg`, `surface` and `surface-raised`; button labels on both gradient stops and on `danger`; badge text on each `*-subtle` fill; status and accent text on surfaces.
- **≥ 3:1 (WCAG non-text contrast)** for the focus ring (`accent-from`) against every surface.

If you add a colour that is used as text or as a background behind text, add its pair to `contrast.test.ts`. The build then shows whether it passes. The Playwright axe checks back this up on real pages.

## Light and dark

Aurora is **dark-first**, and today there is only a dark theme: `styles.css` sets `color-scheme: dark` on `html` so native controls and scrollbars match. All colours are semantic, so a light theme is purely additive: redefine the same `--color-*` names under a `[data-theme='light']` selector, and add the light pairs to `contrast.test.ts`. No component changes are needed, because none of them reference a raw colour.
