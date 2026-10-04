import { hasLocale, NextIntlClientProvider } from "next-intl";
import { Montserrat } from "next/font/google";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import { themeScript } from "@/lib/theme/theme";

import "@/styles/globals.scss";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // suppressHydrationWarning: the theme script sets data-theme, style and class on <html> before hydration.
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={montserrat.variable}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
