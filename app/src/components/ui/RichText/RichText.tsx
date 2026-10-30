import type { ReactNode } from 'react';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { safeHref } from '@/lib/helpers';
import type { RichText as RichTextValue } from '@/sanity.types';
import styles from './RichText.module.scss';

type Props = {
  value: RichTextValue;
  className?: string;
};

// A web link leaves the site, so it opens in a new tab and says so to a screen reader; a mail or phone link
// hands over to another app and stays in the page.
const RichTextLink = ({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) => {
  const t = useTranslations('RichText');
  const isWeb = href.startsWith('https:');

  return (
    <a
      className={styles.richText__link}
      href={href}
      {...(isWeb && { target: '_blank' })}
      rel="noopener noreferrer"
    >
      {children}
      {isWeb && (
        <span className={styles.richText__hidden}>{t('opensInNewTab')}</span>
      )}
    </a>
  );
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className={styles.richText__paragraph}>{children}</p>
    )
  },
  list: {
    bullet: ({ children }) => (
      <ul className={styles.richText__list}>{children}</ul>
    )
  },
  marks: {
    link: ({ children, value }) => {
      const href = safeHref(value?.href);

      return href ? (
        <RichTextLink href={href}>{children}</RichTextLink>
      ) : (
        <>{children}</>
      );
    }
  }
};

const RichText = ({ value, className }: Props) => (
  <div className={clsx(styles.richText, className)}>
    <PortableText value={value} components={components} />
  </div>
);

export default RichText;
