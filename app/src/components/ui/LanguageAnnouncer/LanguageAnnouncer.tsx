'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { takeLocaleSwitch } from '@/lib/helpers';
import styles from './LanguageAnnouncer.module.scss';

const REGION_ID = 'language-announcer';
// Gives assistive tech time to register a freshly created or emptied live region before its text
// changes, and the remounted layout time to settle before focus and hash are restored.
const AFTER_SWITCH_DELAY_MS = 150;

// Returns the live region, creating it outside React on first use: the locale layout is
// remounted on a locale switch, which would replace a React-owned region and drop its text.
const getRegion = (): HTMLElement => {
  const existing = document.getElementById(REGION_ID);
  if (existing) return existing;

  const region = document.createElement('div');
  region.id = REGION_ID;
  region.setAttribute('role', 'status');
  region.className = styles.languageAnnouncer;
  document.body.append(region);
  return region;
};

// A closed menu panel only hides itself with `visibility`, after a delay on close, so anything
// inside it must not count as visible even while the transition is still running.
const CLOSED_PANEL = '[data-open="false"]';

// `checkVisibility` is missing before Safari 17.4; the fallback cannot see `visibility: hidden`
// itself, which is why the closed panel is excluded explicitly.
const isVisible = (element: HTMLElement): boolean =>
  element.closest(CLOSED_PANEL) === null &&
  (typeof element.checkVisibility === 'function'
    ? element.checkVisibility({ visibilityProperty: true })
    : element.getClientRects().length > 0);

// Where keyboard focus goes after a switch: the visible copy of the switcher (the layout renders
// one per breakpoint). On small screens the copy lives in the closed menu panel, which cannot take
// focus, so the menu toggle gets it instead. Right after the remount the panel is closed and no
// transition runs, so this holds at the time of the check.
const findFocusTarget = (): HTMLElement | null =>
  [...document.querySelectorAll<HTMLElement>('[data-language-switcher]')].find(
    isVisible
  ) ?? document.querySelector<HTMLElement>('[data-menu-toggle]');

// After a locale switch, the new layout finishes what the remount lost: it puts the hash back,
// returns keyboard focus to the language switcher and announces the change in the new language
// (no page load happens, so a screen reader would say nothing). Renders nothing.
const LanguageAnnouncer = () => {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();

  useEffect(() => {
    const region = getRegion();
    let announceTimer: number | undefined;

    // The switch is read inside the timer: Strict Mode runs this effect twice in development, and
    // the first run's timer is cleared, so reading it earlier would consume it for nothing.
    const timer = window.setTimeout(() => {
      const localeSwitch = takeLocaleSwitch();
      if (!localeSwitch) return;

      // The proxy redirect from `/en` to `/` drops the hash in a soft navigation. Keep the router's
      // history state, or Next loses track of the entry.
      if (localeSwitch.hash && !window.location.hash) {
        const { pathname, search } = window.location;
        window.history.replaceState(
          window.history.state,
          '',
          `${pathname}${search}${localeSwitch.hash}`
        );
        document.getElementById(localeSwitch.hash.slice(1))?.scrollIntoView();
      }

      // The scroll position is already settled above; focusing must not move it.
      findFocusTarget()?.focus({ preventScroll: true });

      // Emptying first makes a repeated switch to the same language a change, so it is announced.
      region.textContent = '';
      announceTimer = window.setTimeout(() => {
        region.textContent = t('announcement', {
          language: t(`languages.${locale}`)
        });
      }, 0);
    }, AFTER_SWITCH_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(announceTimer);
    };
  }, [locale, t]);

  return null;
};

export default LanguageAnnouncer;
