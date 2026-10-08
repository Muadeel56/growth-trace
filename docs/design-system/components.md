# Components

Everything below is exported from `@growthtrace/design-system` (`packages/design-system/src/index.ts`). Every variant and state is shown live on `/design` (`npm run dev -w @growthtrace/frontend`, then open `localhost:3000/design`). The **On /design** column gives the section anchor.

Props listed are the ones you'll reach for; the source file's TypeScript type is the full contract. Components that wrap a native element (`Button`, `Input`, `Badge`, `Panel`) also accept that element's attributes.

## Primitives

| Component                                                 | Purpose                                                                             | Key props                                                                                                                               | On /design                                |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `Button`                                                  | Every clickable action. 44px tall on touch layouts, compact from `lg`               | `variant`: `primary` \| `ghost` \| `danger`; `size`: `sm` \| `md` \| `lg`; `loading`; `asChild` (style a link as a button)              | `#primitives` → Button                    |
| `Input`                                                   | Labelled text field with hint and error text wired to `aria-describedby`            | `label` (required), `hint`, `error`, plus native input attributes                                                                       | `#primitives` → Input                     |
| `Badge`                                                   | Short status label                                                                  | `tone`: `neutral` \| `success` \| `warning` \| `danger` \| `accent`                                                                     | `#primitives` → Badge                     |
| `Avatar`                                                  | User image with an initials fallback (`initials('Ada Lovelace')` → `AL`)            | `name` (required, used for alt and fallback), `src`, `size`: `sm` \| `md` \| `lg`                                                       | `#primitives` → Avatar                    |
| `Skeleton`                                                | Loading placeholder with a shimmer (static under reduced motion)                    | `className` for size only (`h-4 w-full`)                                                                                                | `#primitives` → Skeleton and Spinner      |
| `Spinner`                                                 | Indeterminate progress, announced to screen readers                                 | `label` (default `Loading`), `size`: `sm` \| `md` \| `lg`                                                                               | `#primitives` → Skeleton and Spinner      |
| `Panel`                                                   | Frosted surface: the base for cards, tiles and sheets. A query container by default | `tone`: `surface` \| `raised`; `padding`: `none` \| `sm` \| `md`; `glow`; `container` (set `false` in content-sized parents); `asChild` | `#primitives` → Panel                     |
| `Tooltip` / `TooltipProvider`                             | Short hint on hover and focus (Radix). Share one provider across many tooltips      | `content`, `side`: `top` \| `right` \| `bottom` \| `left`; the child must be focusable                                                  | `#primitives` → Tooltip, Dialog and Toast |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogClose` | Modal (Radix): focus trap, Esc to close, scroll lock                                | `DialogContent`: `title` (required, labels the dialog), `description`                                                                   | `#primitives` → Tooltip, Dialog and Toast |
| `ToastProvider` / `useToast`                              | Transient notifications. Mount the provider once; `useToast()({ title: 'Synced' })` | `title`, `description`, `tone`: `neutral` \| `success` \| `danger`                                                                      | `#primitives` → Tooltip, Dialog and Toast |
| `AuroraBackground`                                        | Ambient drifting colour fields behind a hero or page. Static under reduced motion   | `className`. Put it in a `relative isolate` parent and give the content `relative z-raised`                                             | Page background                           |

## GrowthTrace components

| Component                   | Purpose                                                                                                       | Key props                                                                                                     | On /design                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `AppShell`                  | App frame: sidebar from `md`, bottom tab bar below (icon-only under 360px), skip link, safe area              | `brand`, `nav: NavItem[]` (`href`, `label`, `icon`, `current`), `actions`, `linkComponent` (e.g. `next/link`) | `#growthtrace` → AppShell (and `/`) |
| `StatTile`                  | One headline number with an optional change and trend. Counts up on mount                                     | `label`, `value`, `delta` (% vs. previous period), `trend: number[]`, `format`                                | `#growthtrace` → StatTile           |
| `StreakMeter`               | Current vs. best streak as text and a segmented meter (FR-5.2)                                                | `current`, `best`, `unit`, `segments`                                                                         | `#growthtrace` → StreakMeter        |
| `ActivityHeatmap`           | GitHub-style contribution grid. One tab stop, arrow keys move between days, each cell has a label and tooltip | `days: HeatmapDay[]` (`date`, `count`, oldest first), `label`, `unit`                                         | `#growthtrace` → ActivityHeatmap    |
| `Timeline` / `TimelineItem` | Chronological event list for the dashboard (FR-5.1)                                                           | `icon`, `title`, `timestamp` (human), `dateTime` (machine), children for detail                               | `#growthtrace` → TimelineItem       |
| `DataTable`                 | Tabular data at any width: `<table>` from `md`, cards (`<dl>` per row) below                                  | `caption` (required), `columns: DataTableColumn[]` (`key`, `header`, `cell`, `numeric`), `rows`, `rowKey`     | `#growthtrace` → DataTable          |
| `ChatBubble`                | One chat message. Shows a shimmer and `aria-busy` while tokens stream in (FR-4.3, FR-5.4)                     | `from`: `user` \| `assistant`; `streaming`                                                                    | `#growthtrace` → ChatBubble         |
| `SyncStatus`                | GitHub sync state as icon plus text, never colour alone (FR-5.3)                                              | `state`: `idle` \| `syncing` \| `synced` \| `error` \| `offline`; `detail` (`2 min ago`)                      | `#growthtrace` → SyncStatus         |

## Charts (`src/charts/`)

| Export        | Purpose                                                                       | Key props                                                                            |
| ------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `Sparkline`   | Minimal Recharts trend line, used inside `StatTile`                           | `data: number[]`, `label` (required, describes the trend for screen readers), `tone` |
| `chartColors` | Chart palette resolved from the colour tokens, for any Recharts chart you add | `accent`, `success`, `danger` (the `ChartTone`s), `grid`, `axis`, `series[]`         |

Charts mark their root with `data-chart` so the responsive check can confirm they fit their container. `src/charts/**` is on the `style` allowlist, so chart code (along with `AuroraBackground`) may pass computed inline styles.

## Helpers

| Export         | Purpose                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `cn()`         | `clsx` + `tailwind-merge`, taught about Aurora's custom tokens. Use it to combine classes                                            |
| `focusRing`    | The shared focus-visible ring classes. Every interactive component uses it                                                           |
| `contrast()`   | WCAG contrast between two colour tokens (see [tokens](tokens.md#contrast-guarantees))                                                |
| Motion exports | `AuroraMotionProvider`, `fadeUp`, `stagger`, `staggerItem`, `glowHover`, `countUp`, `useCountUp`, `motion` (see [motion](motion.md)) |

## Screen states

App screens compose the components above; they don't add styles of their own. The dashboard (`frontend/src/app/dashboard.tsx`) has four states: **ready** (rendered at `/`), **loading** (`Skeleton` panels in the ready layout, plus `SyncStatus` `syncing`), **empty** (`SyncStatus` `idle` and an explanation) and **error** (`SyncStatus` `error` and a retry link). The loading, empty and error states are shown under [Dashboard states](http://localhost:3000/design#dashboard-states) on `/design`. A new screen state goes there too, so the responsive and axe checks cover it.

## Adding a component

Follow [Adding a component](../../packages/design-system/README.md#adding-a-component) in the package README, then add a row here.
