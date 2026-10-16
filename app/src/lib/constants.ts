// Media queries used with `window.matchMedia()`.

export const DARK_QUERY = '(prefers-color-scheme: dark)';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Also requires no reduced-motion preference, not only a fine hover-capable pointer.
export const POINTER_QUERY =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

// Matches the `lg` breakpoint in styles/_mixins.scss.
export const DESKTOP_QUERY = '(min-width: 1024px)';
