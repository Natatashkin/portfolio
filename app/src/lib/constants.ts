// Media queries used with `window.matchMedia()`.

export const DARK_QUERY = '(prefers-color-scheme: dark)';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Also requires no reduced-motion preference, not only a fine hover-capable pointer.
export const POINTER_QUERY =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

// Matches the `lg` breakpoint in styles/_mixins.scss.
export const DESKTOP_QUERY = '(min-width: 1024px)';

// Breakpoints in pixels, for the places that cannot read the SCSS variables.

// One pixel below the `md` breakpoint (768px) in styles/_mixins.scss.
export const MOBILE_MAX_WIDTH = 767;

// Storage keys.

export const THEME_STORAGE_KEY = 'theme';

// A locale switch remounts the whole locale layout (the segment key changes) without reloading
// the document, so React state cannot carry anything across it. sessionStorage can.
export const LOCALE_SWITCH_STORAGE_KEY = 'localeSwitch';

// Timing.

// A remembered switch older than this was abandoned (new tab, cancelled navigation).
export const LOCALE_SWITCH_MAX_AGE_MS = 10_000;

// Gives assistive tech time to register a freshly created or emptied live region before its text
// changes, and the remounted layout time to settle before focus and hash are restored.
export const AFTER_SWITCH_DELAY_MS = 150;

// Caps how long loading GSAP waits for the browser to be idle.
export const IDLE_TIMEOUT_MS = 2000;

// Stands in for `requestIdleCallback`, which Safari lacks.
export const IDLE_FALLBACK_DELAY_MS = 200;

// DOM ids and selectors.

export const LANGUAGE_ANNOUNCER_REGION_ID = 'language-announcer';

// A closed menu panel only hides itself with `visibility`, after a delay on close, so anything
// inside it must not count as visible even while the transition is still running.
export const CLOSED_PANEL_SELECTOR = '[data-open="false"]';

// Validation patterns and allowlists.

// Same pattern as the anchor validation in the Studio schema.
export const ANCHOR_PATTERN = /^[a-z]+(?:-[a-z]+)*$/i;

// Same rule as the Studio validation for internal links: slash-less segments of letters,
// digits and hyphens. Studio checks only edits made in Studio, so a value written through the
// API (e.g. "/evil.com", which would become the protocol-relative "//evil.com") is dropped.
export const INTERNAL_PATH_PATTERN = /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/i;

// Editor-entered URLs reach `href`; anything but https, mailto and tel is dropped.
export const ALLOWED_LINK_PROTOCOLS = ['https:', 'mailto:', 'tel:'];

// Name offered to the browser when a downloaded Sanity file has no original filename.
export const DEFAULT_DOWNLOAD_FILENAME = 'document.pdf';

// A Sanity asset `_ref` encodes the intrinsic size ("image-<id>-1200x800-jpg").
export const IMAGE_REF_PATTERN = /^image-[A-Za-z0-9]+-(\d+)x(\d+)-[a-z]+$/;

// Hero grid pointer tracking.

// Easing factor per frame: how much of the remaining distance to the pointer is covered.
export const HERO_GRID_SMOOTHING = 0.12;

// In pixels: closer than this to the pointer counts as settled and the animation loop stops.
export const HERO_GRID_SETTLE_DISTANCE = 0.5;

// Resting position as fractions of the element's width and height.
export const HERO_GRID_START_X = 0.5;
export const HERO_GRID_START_Y = 0.4;
