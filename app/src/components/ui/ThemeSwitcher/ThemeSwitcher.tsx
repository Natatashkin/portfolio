'use client';

import { useTranslations } from 'next-intl';
import { DotIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { useTheme } from '@/hooks/useTheme';
import styles from './ThemeSwitcher.module.scss';

// Temporary design: final behavior and design are not decided yet.
// A two-way toggle on the effective theme: the label and the click both lead to the opposite one.
// The label is chosen by CSS and the click target by JS; both read the same sources (the stored theme
// and the system preference), so they must always agree.
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

  // The stored theme is unknown on the server, so both labels are in the HTML and CSS shows the one
  // matching <html data-theme> (set before first paint), which avoids an empty button until hydration.
  // Until mount the name comes from the visible label; the aria-label is added once the target is known.
  return (
    <Button
      label={
        <>
          <span className={styles.themeSwitcher__toLight}>{t('light')}</span>
          <span className={styles.themeSwitcher__toDark}>{t('dark')}</span>
        </>
      }
      aria-label={
        isMounted ? t('switchTo', { theme: t(targetTheme) }) : undefined
      }
      variant="transparent"
      className={styles.themeSwitcher__button}
      onClick={handleClick}
    >
      <DotIcon />
    </Button>
  );
};

export default ThemeSwitcher;
