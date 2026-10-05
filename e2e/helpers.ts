import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Waits for entrance animations to finish (ambient, infinite ones are ignored). */
export async function settle(page: Page) {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
}

/** Settled animations and loaded web fonts: the page is ready to measure. */
export async function prepare(page: Page) {
  await settle(page);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** The page must never scroll sideways; wide content scrolls inside its own container. */
export async function expectNoOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect
    .soft(
      scrollWidth,
      `page scrolls sideways: scrollWidth ${scrollWidth}px > viewport ${clientWidth}px`,
    )
    .toBeLessThanOrEqual(clientWidth);
}

/**
 * Every visible element lies inside the viewport horizontally. Elements inside an
 * ancestor that clips or scrolls on the x axis (e.g. the heatmap) are measured by that
 * ancestor instead, so they are skipped.
 */
export async function expectNoStickOut(page: Page) {
  const offenders = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const describe = (el: Element) => {
      const r = el.getBoundingClientRect();
      const landmark = el.closest('main, nav, header, footer, aside, section, [role]');
      const where = landmark
        ? `${landmark.tagName.toLowerCase()}${landmark.id ? `#${landmark.id}` : ''}${
            landmark.getAttribute('aria-label') ? `[${landmark.getAttribute('aria-label')}]` : ''
          }`
        : 'body';
      return `<${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}"> x ${Math.round(
        r.left,
      )}..${Math.round(r.right)} (viewport 0..${viewport}) in ${where}`;
    };
    const clipsX = (el: Element) => getComputedStyle(el).overflowX !== 'visible';

    const found: string[] = [];
    for (const el of document.body.querySelectorAll('*')) {
      if (el.closest('.sr-only')) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      let parent = el.parentElement;
      let clipped = false;
      while (parent && parent !== document.body) {
        if (clipsX(parent)) {
          clipped = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (clipped) continue;
      if (r.left < -1 || r.right > viewport + 1) found.push(describe(el));
    }
    return found;
  });
  expect
    .soft(offenders, `elements stick out past the viewport:\n${offenders.join('\n')}`)
    .toEqual([]);
}

/**
 * No text is cut off by an `overflow: hidden | clip` box. Deliberate truncation is fine
 * when it uses `text-overflow: ellipsis` and the full text is in `title` or `aria-label`.
 */
export async function expectNoClippedText(page: Page) {
  const offenders = await page.evaluate(() => {
    const clips = (v: string) => v === 'hidden' || v === 'clip';
    const found: string[] = [];
    for (const el of document.body.querySelectorAll<HTMLElement>('*')) {
      if (el.closest('.sr-only')) continue;
      const style = getComputedStyle(el);
      if (!clips(style.overflowX) && !clips(style.overflowY)) continue;
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (
        style.textOverflow === 'ellipsis' &&
        (el.getAttribute('title') || el.getAttribute('aria-label'))
      ) {
        continue;
      }
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      // Padding box: the area overflow clips to.
      const left = box.left + el.clientLeft;
      const top = box.top + el.clientTop;
      const right = left + el.clientWidth;
      const bottom = top + el.clientHeight;

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim() || node.parentElement?.closest('.sr-only')) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const outside = [...range.getClientRects()].some(
          (t) =>
            (clips(style.overflowX) && (t.left < left - 1 || t.right > right + 1)) ||
            (clips(style.overflowY) && (t.top < top - 1 || t.bottom > bottom + 1)),
        );
        if (outside) {
          found.push(
            `<${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}"> clips "${node.textContent.trim().slice(0, 40)}"`,
          );
          break;
        }
      }
    }
    return found;
  });
  expect.soft(offenders, `text is clipped:\n${offenders.join('\n')}`).toEqual([]);
}

const TAP_TARGETS = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[tabindex]',
].join(',');

/**
 * Interactive elements are at least 44×44px (touch layouts only). Exempt: links inside
 * running text (WCAG 2.5.8 inline exception) and anything with a non-empty
 * `data-tap-exempt="<reason>"`. A control inside a <label> is measured by its label,
 * since tapping the label activates it.
 */
export async function expectTapTargets(page: Page, min = 44) {
  const offenders = await page.evaluate(
    ({ selector, min }) => {
      const found: string[] = [];
      for (const el of document.body.querySelectorAll<HTMLElement>(selector)) {
        if (el.closest('.sr-only')) continue;
        // Programmatic focus targets (tabindex="-1", e.g. <main>) aren't tapped.
        if (el.tabIndex < 0 && !el.matches('a[href], button, input, select, textarea')) continue;
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        if (el.matches('p a')) continue;
        if (el.hasAttribute('data-tap-exempt')) {
          if (!el.getAttribute('data-tap-exempt')?.trim()) {
            found.push(`<${el.tagName.toLowerCase()}> has data-tap-exempt without a reason`);
          }
          continue;
        }
        const target = el.closest('label') ?? el;
        const r = target.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.width < min - 0.5 || r.height < min - 0.5) {
          const name =
            el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 30) ?? el.tagName;
          found.push(
            `<${el.tagName.toLowerCase()}> "${name}" is ${Math.round(r.width)}×${Math.round(r.height)}px`,
          );
        }
      }
      return found;
    },
    { selector: TAP_TARGETS, min },
  );
  expect.soft(offenders, `tap targets under ${min}×${min}px:\n${offenders.join('\n')}`).toEqual([]);
}

/** Every chart (`[data-chart]`) fits its parent's content box. */
export async function expectChartsFit(page: Page) {
  const offenders = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-chart]')].flatMap((chart) => {
      const parent = chart.parentElement;
      if (!parent) return [];
      const style = getComputedStyle(parent);
      const content =
        parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const width = chart.getBoundingClientRect().width;
      return width > content + 1
        ? [`${chart.getAttribute('aria-label') ?? chart.className}: ${width}px > ${content}px`]
        : [];
    }),
  );
  expect.soft(offenders, `charts wider than their container:\n${offenders.join('\n')}`).toEqual([]);
}

/** WCAG 2.2 AA axe scan. Fails on any violation. */
export async function expectAccessible(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const found = violations.map(
    (v) =>
      `${v.id} [${v.impact}] (${v.nodes.length}): ${v.help} -> ${v.nodes
        .slice(0, 3)
        .map((n) => n.target.join(' '))
        .join(', ')}`,
  );
  expect.soft(found, `axe violations:\n${found.join('\n')}`).toEqual([]);
}

/** The real backend. Tests must hit the fixture server (e2e/fixtures/server.ts) instead. */
const REAL_API_ORIGIN = process.env.REAL_API_ORIGIN ?? 'http://localhost:4000';

/**
 * Blocks browser requests to the real backend, so nothing quietly reaches a running one.
 * Returns the list of blocked URLs; assert it is empty at the end of the test.
 */
export async function mockApi(page: Page): Promise<string[]> {
  const blocked: string[] = [];
  await page.route(`${REAL_API_ORIGIN}/**`, (route) => {
    blocked.push(route.request().url());
    return route.abort('blockedbyclient');
  });
  return blocked;
}
