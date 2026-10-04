import { hasLocale, type Locale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";

import { routing } from "./routing";

// Explicit loaders keep the message types intact (a template-string import would be untyped).
const loadMessages = {
  en: () => import("../../messages/en.json"),
  uk: () => import("../../messages/uk.json"),
} satisfies Record<Locale, () => Promise<unknown>>;

export default getRequestConfig(async ({ locale: requestedLocale }) => {
  let locale = requestedLocale;

  if (!locale) {
    const paramValue = await rootParams.locale();
    if (!hasLocale(routing.locales, paramValue)) notFound();
    locale = paramValue;
  }

  return {
    locale,
    messages: (await loadMessages[locale]()).default,
  };
});
