import { useTranslations } from 'next-intl';
import { ArrowIcon, DownloadIcon } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { ANCHOR_PATTERN, DEFAULT_DOWNLOAD_FILENAME } from '@/lib/constants';
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
  hasIcon,
  fileUrl,
  fileName
}: LinkButtonProps) => {
  const t = useTranslations('LinkButton');

  if (!label) return null;

  const variantClass = variant ? styles[`button--${variant}`] : undefined;
  const className = `${styles.button} ${variantClass ?? styles['button--primary']}`;
  const content = (
    <>
      {label}
      {hasIcon && (linkType === 'download' ? <DownloadIcon /> : <ArrowIcon />)}
    </>
  );

  // Checked before `url`: Studio keeps a stale `url` after the link type is switched, and a download ignores it.
  if (linkType === 'download') {
    const fileHref = safeHref(fileUrl);

    // `safeHref` also lets mailto and tel through; a file link must be https.
    if (!fileHref?.startsWith('https:')) return null;

    // The `download` attribute is ignored for a cross-origin CDN URL; `?dl=` makes the Sanity CDN
    // answer with `Content-Disposition: attachment` (to be confirmed in a browser).
    // `safeHref` has already parsed the string, so `new URL` cannot throw here.
    const downloadUrl = new URL(fileHref);
    downloadUrl.searchParams.set('dl', fileName || DEFAULT_DOWNLOAD_FILENAME);

    return (
      <a className={className} href={downloadUrl.toString()} download>
        {content}
        <span className={styles.button__hidden}>{t('download')}</span>
      </a>
    );
  }

  if (!url) return null;

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
