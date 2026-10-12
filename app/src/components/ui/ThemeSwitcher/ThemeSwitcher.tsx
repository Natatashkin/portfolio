'use client';

import { useTranslations } from 'next-intl';
import { DotIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
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
const ThemeSwitcher = () => {
  const t = useTranslations('ThemeSwitcher');
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  const handleClick = () => setTheme(NEXT_THEME[theme]);

  // The stored theme is unknown until mount, so render a same-size neutral box instead of a guess.
  if (!isMounted) {
    return (
      <span className={styles.themeSwitcher__placeholder} aria-hidden="true" />
    );
  }

  return (
    <Button
      label={t(theme)}
      variant="transparent"
      className={styles.themeSwitcher__button}
      onClick={handleClick}
    >
      <DotIcon />
    </Button>
  );
};

export default ThemeSwitcher;
