// Same rule as the Studio validation for internal links: slash-less segments of letters,
// digits and hyphens. Studio checks only edits made in Studio, so a value written through the
// API (e.g. "/evil.com", which would become the protocol-relative "//evil.com") is dropped here.
const INTERNAL_PATH = /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/i;

export const safePath = (path: string | null | undefined): string | null =>
  path && INTERNAL_PATH.test(path) ? `/${path}` : null;
