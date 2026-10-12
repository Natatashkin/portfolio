const ALLOWED_PROTOCOLS = ['https:', 'mailto:', 'tel:'];

// Editor-entered URLs reach `href`; anything but https, mailto and tel is dropped.
export const safeHref = (href: string | null | undefined): string | null => {
  if (!href) return null;

  try {
    return ALLOWED_PROTOCOLS.includes(new URL(href).protocol) ? href : null;
  } catch {
    return null;
  }
};
