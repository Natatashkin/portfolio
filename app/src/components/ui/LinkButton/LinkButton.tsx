import { useTranslations } from 'next-intl';
import { ArrowIcon } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { ANCHOR_PATTERN } from '@/lib/constants';
import { safeHref, safePath } from '@/lib/helpers';
import styles from './LinkButton.module.scss';
import type { LinkButtonProps } from './types';

const LinkButton = ({
  label,
  linkType,
  url,
  hasAnchor,
  anchor,
  variant,
  hasIcon
}: LinkButtonProps) => {
  const t = useTranslations('LinkButton');

  if (!label || !url) return null;

  const variantClass = variant ? styles[`button--${variant}`] : undefined;
  const className = `${styles.button} ${variantClass ?? styles['button--primary']}`;
  const content = (
    <>
      {label}
      {hasIcon && <ArrowIcon />}
    </>
  );

  if (linkType === 'external') {
    const href = safeHref(url);

    return href ? (
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
        <span className={styles.button__hidden}>{t('opensInNewTab')}</span>
      </a>
    ) : null;
  }

  const path = safePath(url);
  const hash =
    hasAnchor && anchor && ANCHOR_PATTERN.test(anchor) ? `#${anchor}` : '';

  return path ? (
    <Link className={className} href={`${path}${hash}`}>
      {content}
    </Link>
  ) : null;
};

export default LinkButton;
