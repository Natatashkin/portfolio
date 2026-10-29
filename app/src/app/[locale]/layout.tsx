import type { Metadata } from 'next';
import { Caveat, Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import ThemeScript from '@/components/layout/ThemeScript';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import LanguageAnnouncer from '@/components/ui/LanguageAnnouncer';
import { routing } from '@/i18n/routing';
import { fetchSiteSettings } from '@/lib/sanity/api/fetchSiteSettings';

import '@/styles/globals.scss';

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  style: ['normal'],
  variable: '--font-montserrat',
  display: 'swap'
});

// Handwriting accent for short sign-offs and notes (`--font-handwritten`), used where the design
// asks for it, not for body text. Not preloaded: it is used below the fold; revisit if it is used above.
const caveat = Caveat({
  subsets: ['latin', 'cyrillic'],
  weight: ['600'],
  variable: '--font-caveat',
  display: 'swap',
  preload: false
});

// Pre-launch: keep the site out of search engines. Remove when going live.
export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }));

const LocaleLayout = async ({ children, params }: LayoutProps<'/[locale]'>) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const siteSettings = await fetchSiteSettings(locale);

  // suppressHydrationWarning: the theme script sets data-theme, style and class on <html> before hydration.
  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <NextIntlClientProvider>
          <SmoothScrollProvider>
            <Header
              navigation={siteSettings?.navigation ?? []}
              siteName={siteSettings?.siteName ?? null}
              socialLinks={siteSettings?.socialLinks ?? []}
            />
            {children}
            <LanguageAnnouncer />
            <Footer
              copyright={siteSettings?.copyright ?? null}
              socialLinks={siteSettings?.socialLinks ?? []}
            />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
