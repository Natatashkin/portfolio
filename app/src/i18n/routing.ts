import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'uk'],
  defaultLocale: 'en',
  // English lives at `/` without a prefix; `/en/...` redirects to the unprefixed path.
  localePrefix: 'as-needed'
});
