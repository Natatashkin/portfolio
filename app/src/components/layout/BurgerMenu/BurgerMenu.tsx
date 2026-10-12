'use client';

import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState
} from 'react';
import { useLenis } from 'lenis/react';
import { useTranslations } from 'next-intl';
import { BurgerIcon, CloseIcon } from '@/components/icons';
import styles from './BurgerMenu.module.scss';

type Props = {
  children: ReactNode;
};

// Matches the `lg` breakpoint in styles/_mixins.scss: from here the mobile menu is not shown.
const DESKTOP_QUERY = '(min-width: 1024px)';

// Mobile menu: burger toggle plus a full-screen panel. Hidden from `lg`, where the header shows the desktop navigation.
const BurgerMenu = ({ children }: Props) => {
  const t = useTranslations('Header');
  const panelId = useId();
  const lenis = useLenis();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((open) => !open);

  // A tapped link (anchor or page) means the visitor chose a destination, so the panel gets out of the way.
  const handlePanelClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      toggleRef.current?.focus();
    };
    const query = window.matchMedia(DESKTOP_QUERY);
    const handleQueryChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    query.addEventListener('change', handleQueryChange);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      query.removeEventListener('change', handleQueryChange);
    };
  }, [isOpen]);

  // Lenis intercepts wheel events, so overflow alone doesn't lock the page while it is running.
  useEffect(() => {
    if (!isOpen) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    lenis?.stop();

    return () => {
      root.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [isOpen, lenis]);

  return (
    <div className={styles.headerMenu}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.headerMenu__toggle}
        aria-label={t('menu')}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggle}
      >
        {isOpen ? <CloseIcon /> : <BurgerIcon />}
      </button>
      <div
        id={panelId}
        className={styles.headerMenu__panel}
        data-open={isOpen}
        data-lenis-prevent
        onClick={handlePanelClick}
      >
        {children}
      </div>
    </div>
  );
};

export default BurgerMenu;
