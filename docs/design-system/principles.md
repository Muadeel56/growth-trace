# Aurora principles

Aurora (`@growthtrace/design-system`, in `packages/design-system/`) is the only source of styling in GrowthTrace. This page explains why it exists and what the rule means in practice. How to add a token or component is in the [package README](../../packages/design-system/README.md); the decision itself is [ADR 0002](../adr/0002-aurora-design-system.md).

## Why a design system first

- **Humans and coding agents both write UI here.** Without a hard boundary every feature drifts: another grey, another 13px gap, another hand-rolled spinner. Aurora gives everyone the same small vocabulary.
- **Accessibility is decided once.** Contrast ratios, focus rings, 44px tap targets and reduced motion are guaranteed by the tokens and components (and tested there), so feature code doesn't have to re-prove them.
- **The look can change in one place.** Every colour, size, radius, shadow and duration is a token. Changing a token re-themes the whole app.

## The styling rule

> All UI is built from `@growthtrace/design-system`. If a style you need doesn't exist, add a token (to `tokens.css` and `tokens.ts`) or a component to the design system first, show it on `/design`, and then use it. Never style a one-off.

Feature code _arranges_ Aurora components and layout utilities (`flex`, `grid`, `gap-4`, `md:grid-cols-2`). It never _styles_ them. The rule is enforced by ESLint, Stylelint and `check:styles` ([enforcement table](../../packages/design-system/README.md#enforcement)), and `eslint-disable` comments can't switch those rules off.

## Do / don't

| Don't                                                                  | Why it fails                                                         | Do instead                                                                       |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `<div className="w-[37px] bg-[#0f172a]">`                              | `aurora/no-arbitrary-values`: one-off size and colour                | `<div className="size-10 bg-surface">`, or add a token if the scale lacks it     |
| `<p className="text-gray-400 p-5">`                                    | `better-tailwindcss/no-unknown-classes`: Tailwind defaults are wiped | `<p className="text-muted p-4">`                                                 |
| `<div style={{ marginTop: 12 }}>`                                      | `aurora/no-style-prop`                                               | `<div className="mt-3">`                                                         |
| `const accent = '#7dd3c0'` in a `.tsx` file                            | `aurora/no-raw-colors`                                               | A colour class (`text-accent-from`), or `tokens.color['accent-from']` for charts |
| `import './dashboard.css'`                                             | `aurora/no-css-imports` and `check:styles`                           | Token classes; if a pattern repeats, make it a component                         |
| `<motion.div animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>` | `aurora/no-inline-motion`                                            | `<motion.div {...fadeUp}>` from `motion/presets.ts` (see [motion](motion.md))    |
| `className="bg-surface/37"` or `opacity-35`                            | `aurora/no-off-scale-opacity`                                        | A step from the scale: `bg-surface/40`, `opacity-30`                             |
| `className="z-50"`                                                     | `aurora/no-bare-z-index`                                             | A named layer: `z-dialog`, `z-toast`                                             |
| `className="max-md:hidden"`                                            | `aurora/no-desktop-first`                                            | Mobile-first: `hidden md:block`                                                  |
| `<button className="rounded-lg bg-accent-gradient px-4 …">`            | Re-implements `Button`, and drifts from it                           | `<Button variant="primary">`                                                     |
| `// eslint-disable-next-line aurora/no-style-prop`                     | `eslint-comments/no-restricted-disable`                              | Fix the design system, or argue for an allowlist entry in review                 |

## When Aurora doesn't have what you need

1. **Look again on `/design`.** Most needs are a variant of something that exists (`Panel tone="raised"`, `Badge tone="warning"`).
2. **A missing value** (a colour, a spacing step): add a token, following [Adding a token](../../packages/design-system/README.md#adding-a-token).
3. **A missing pattern** (something you'd otherwise build from several styled divs): add a component, following [Adding a component](../../packages/design-system/README.md#adding-a-component).
4. **Show it on `/design`** so the next person finds it, and update [tokens.md](tokens.md) or [components.md](components.md).
5. **Only then** use it in the feature.

An allowlist exception (`packages/config/eslint.config.js`) is the last resort and needs a reason in the PR. The current list is in the [allowlist policy](../../packages/design-system/README.md#allowlist-policy).
