import { Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import { routing } from '@/i18n/routing';
import { fetchSiteSettings } from '@/lib/sanity/api/fetchSiteSettings';
import { themeScript } from '@/lib/theme/theme';

import '@/styles/globals.scss';

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  style: ['normal'],
  variable: '--font-montserrat',
  display: 'swap'
});

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
      className={montserrat.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
