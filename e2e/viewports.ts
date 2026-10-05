/**
 * The responsive matrix every spec loops over. Add a page to `routes` and it gets every
 * check at every width.
 */
type Viewport = {
  name: string;
  width: number;
  height: number;
  /** Touch layout: 44px tap targets apply. 768 counts, since tablets in portrait are touch-first. */
  mobile: boolean;
  /** Run only in Chromium (the 4K rows check scaling, not engine differences). */
  chromiumOnly?: boolean;
  /**
   * One row per distinct layout. Locally (pre-commit, verify) axe runs only on these, since
   * it costs ~7s a page and results follow the layout, not the exact width. CI runs it on all.
   */
  axe?: boolean;
};

export const viewports: Viewport[] = [
  { name: 'xs-320', width: 320, height: 640, mobile: true, axe: true },
  { name: 'phone-375', width: 375, height: 812, mobile: true, axe: true },
  { name: 'phone-414', width: 414, height: 896, mobile: true },
  { name: 'tablet-768-portrait', width: 768, height: 1024, mobile: true, axe: true },
  { name: 'tablet-1024-landscape', width: 1024, height: 768, mobile: false },
  { name: 'laptop-1024', width: 1024, height: 768, mobile: false },
  { name: 'laptop-1280', width: 1280, height: 800, mobile: false },
  { name: 'desktop-1440', width: 1440, height: 900, mobile: false, axe: true },
  { name: 'desktop-1920', width: 1920, height: 1080, mobile: false },
  { name: 'qhd-2560', width: 2560, height: 1440, mobile: false, chromiumOnly: true },
  { name: 'uhd-3840', width: 3840, height: 2160, mobile: false, chromiumOnly: true },
];

export const routes = ['/', '/design'] as const;

/** `md` breakpoint: below it the bottom tab bar shows and tables render as cards. */
export const MD = 768;

/** "/" -> "home", "/design" -> "design": stable names for screenshot files. */
export const routeSlug = (route: string) => route.replace(/^\//, '').replace(/\//g, '-') || 'home';
