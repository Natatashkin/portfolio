'use client';

import { type MouseEvent, useSyncExternalStore } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DotIcon } from '@/components/icons';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { rememberLocaleSwitch } from '@/lib/helpers';
import styles from './LanguageSwitcher.module.scss';

const subscribeToHash = (handleChange: () => void): (() => void) => {
  window.addEventListener('hashchange', handleChange);
  return () => window.removeEventListener('hashchange', handleChange);
};

const getHashSnapshot = () => window.location.hash;
const getServerHashSnapshot = () => '';

// A plain left click navigates in this tab; modified clicks open a new tab or window, and those
// must not leave a remembered switch behind for the next page load.
const isPlainClick = (event: MouseEvent) =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

// A link to the same page in the other locale. `usePathname` and `Link` carry no hash, so it is
// read from the address bar; the server snapshot is empty to avoid a hydration mismatch.
const LanguageSwitcher = () => {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const hash = useSyncExternalStore(
    subscribeToHash,
    getHashSnapshot,
    getServerHashSnapshot
  );

  const target = routing.locales.find((item) => item !== locale);
  if (!target) return null;

  const handleClick = (event: MouseEvent) => {
    if (isPlainClick(event)) rememberLocaleSwitch(window.location.hash);
  };

  return (
    <Link
      className={styles.languageSwitcher}
      href={`${pathname}${hash}`}
      locale={target}
      data-language-switcher=""
      // Starts with the visible code (label in name), then names the target language.
      aria-label={t('label', {
        code: target.toUpperCase(),
        language: t(`languages.${target}`)
      })}
      onClick={handleClick}
    >
      {/* The visible code is in the target language, while <html lang> is the current one. */}
      <span lang={target}>{target.toUpperCase()}</span>
      <DotIcon />
    </Link>
  );
};

export default LanguageSwitcher;
