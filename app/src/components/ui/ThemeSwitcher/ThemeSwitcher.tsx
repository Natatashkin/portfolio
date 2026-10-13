'use client';

import { useTranslations } from 'next-intl';
import { DotIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { useTheme } from '@/hooks/useTheme';
import styles from './ThemeSwitcher.module.scss';

// Placeholder UI: final behavior and design are not decided yet.
// A two-way toggle on the effective theme: the label and the click both lead to the opposite one.
const ThemeSwitcher = () => {
  const t = useTranslations('ThemeSwitcher');
  const { theme, setTheme } = useTheme();
  const systemTheme = useSystemTheme();
  const isMounted = useIsMounted();

  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  const targetTheme = effectiveTheme === 'dark' ? 'light' : 'dark';

  // Choosing the system's own theme stores "system", so the page keeps following the OS.
  const handleClick = () =>
    setTheme(targetTheme === systemTheme ? 'system' : targetTheme);

  // The stored theme is unknown until mount, so render a same-size neutral box instead of a guess.
  if (!isMounted) {
    return (
      <span className={styles.themeSwitcher__placeholder} aria-hidden="true" />
    );
  }

  return (
    <Button
      label={t(targetTheme)}
      aria-label={t('switchTo', { theme: t(targetTheme) })}
      variant="transparent"
      className={styles.themeSwitcher__button}
      onClick={handleClick}
    >
      <DotIcon />
    </Button>
  );
};

export default ThemeSwitcher;
