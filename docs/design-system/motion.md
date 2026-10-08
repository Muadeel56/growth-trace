# Motion

Aurora's motion is subtle and functional: things fade up into place, numbers count up, interactive surfaces lift a little. All of it comes from tokens and presets, and all of it stops when the viewer asks for reduced motion.

## Building blocks

| Piece                  | File                                      | What it does                                                                                   |
| ---------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Duration/easing tokens | `src/tokens/tokens.ts` / `tokens.css`     | `fast` 150ms, `base` 250ms, `slow` 500ms, `ambient` 30s; `out-expo` and `spring` easings       |
| Presets                | `src/motion/presets.ts`                   | Ready-made Motion props, timed from the tokens via `seconds()` and `bezier()`                  |
| `AuroraMotionProvider` | `src/motion/AuroraMotionProvider.tsx`     | Wrap the app once. Sets Motion's `reducedMotion` and a `data-reduced-motion` attribute for CSS |
| `useCountUp`           | `src/motion/useCountUp.ts`                | Animates a number from 0 to its value (`StatTile`)                                             |
| CSS animations         | `tokens.css` (`@keyframes`) + `animate-*` | `aurora-drift`, `shimmer`, `spin`, always applied behind the `motion-ok:` variant              |

### Presets

| Preset                    | Use                                                                             |
| ------------------------- | ------------------------------------------------------------------------------- |
| `fadeUp`                  | Fade in while rising one spacing step (8px), on `base` duration with `out-expo` |
| `stagger` + `staggerItem` | A parent that reveals its `staggerItem` children one after another              |
| `glowHover`               | Small scale on hover (1.02) and press (0.98), on `fast` with `spring`           |
| `countUp`                 | Timing for `useCountUp` (2 × `slow`, `out-expo`)                                |

```tsx
import { fadeUp, motion, stagger, staggerItem } from '@growthtrace/design-system';

<motion.ul {...stagger}>
  {items.map((item) => (
    <motion.li key={item.id} {...staggerItem}>
      {item.title}
    </motion.li>
  ))}
</motion.ul>;
```

## Reduced motion

Aurora respects `prefers-reduced-motion` in three places:

1. **Motion (JS) animations.** `AuroraMotionProvider` wraps the tree in Motion's `MotionConfig`. With the default `reducedMotion="user"`, Motion skips transform and layout animation when the OS asks for reduced motion. `reducedMotion="always"` forces it off, which the `/design` page toggle uses.
2. **CSS animations.** The `motion-ok:` custom variant (`styles.css`) applies a class only when `prefers-reduced-motion: no-preference` **and** no ancestor has `data-reduced-motion="always"`. Every CSS animation must sit behind it: `motion-ok:animate-shimmer`, never bare `animate-shimmer`.
3. **Count-up numbers.** `useCountUp` reads Motion's reduced-motion config and jumps straight to the final value. Its first render is always 0, so server and client markup match.

`AuroraBackground` becomes static and `Skeleton` stops shimmering under reduced motion. Playwright runs the responsive check with `reducedMotion: 'reduce'` (stable screenshots), and `design.spec.ts` renders `/design` both ways.

## Why there are no inline animations

`aurora/no-inline-motion` rejects `initial={{…}}`, `animate={{…}}`, `transition={{…}}` and the other inline Motion objects everywhere except `src/motion/`. Here's why:

- **Consistency.** A hand-written `{ duration: 0.3 }` drifts from the tokens immediately, and the next person writes `0.35`. Presets keep every timing on the scale.
- **Reduced motion by construction.** Presets are built and checked once for reduced-motion behaviour. Inline objects would each have to get it right on their own.
- **Retuning in one place.** Changing `--duration-base` or a preset changes the feel of the whole app.

If a preset doesn't fit, add a new one to `presets.ts` (timed from tokens), show it on `/design#motion`, and spread it. Keyframe animations go in `tokens.css` as an `--animate-*` token.
