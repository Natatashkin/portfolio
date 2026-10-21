import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { hasLocale, type Locale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

type EnMessages = typeof import('../../messages/en.json');
type UkMessages = typeof import('../../messages/uk.json');

// Resolves to the messages type only when both files have the same keys; otherwise to `never`, so the
// `satisfies` below fails to compile. A key missing from `uk.json`, or left behind in it, is a type error.
// TypeScript does not name the key: compare the two JSON files.
type SameKeys<A, B> = [A] extends [B] ? ([B] extends [A] ? A : never) : never;

// Explicit loaders keep the message types intact (a template-string import would be untyped).
const loadMessages = {
  en: () => import('../../messages/en.json'),
  uk: () => import('../../messages/uk.json')
} satisfies Record<
  Locale,
  () => Promise<{ default: SameKeys<EnMessages, UkMessages> }>
>;

export default getRequestConfig(async ({ locale: requestedLocale }) => {
  let locale = requestedLocale;

  if (!locale) {
    const paramValue = await rootParams.locale();
    if (!hasLocale(routing.locales, paramValue)) notFound();
    locale = paramValue;
  }

  return {
    locale,
    messages: (await loadMessages[locale]()).default
  };
});
