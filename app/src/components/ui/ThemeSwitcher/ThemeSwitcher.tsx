'use client';

import { useTranslations } from 'next-intl';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/lib/theme/theme';
import styles from './ThemeSwitcher.module.scss';

const NEXT_THEME: Record<Theme, Theme> = {
  system: 'light',
  light: 'dark',
  dark: 'system'
};

// Placeholder UI: final behavior and design are not decided yet.
export function ThemeSwitcher() {
  const t = useTranslations('ThemeSwitcher');
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  // The stored theme is unknown until mount, so render a same-size neutral box instead of a guess.
  if (!isMounted) {
    return <span className={styles.placeholder} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => setTheme(NEXT_THEME[theme])}
    >
      {t('label')}: {t(theme)}
    </button>
  );
}
