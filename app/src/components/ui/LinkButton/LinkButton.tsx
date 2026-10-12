import { ArrowIcon } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { safeHref } from '@/lib/helpers/safeHref';
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
  if (!label || !url) return null;

  const className = `${styles.button} ${styles[`button--${variant ?? 'primary'}`]}`;
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
      </a>
    ) : null;
  }

  const hash = hasAnchor && anchor ? `#${anchor}` : '';

  return (
    <Link className={className} href={`/${url}${hash}`}>
      {content}
    </Link>
  );
};

export default LinkButton;
