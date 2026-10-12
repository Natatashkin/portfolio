import { PortableText, type PortableTextComponents } from '@portabletext/react';
import { safeHref } from '@/lib/helpers/safeHref';
import type { RichText as RichTextValue } from '@/sanity.types';
import styles from './RichText.module.scss';

type Props = {
  value: RichTextValue;
  className?: string;
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
        <a
          className={styles.richText__link}
          href={href}
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ) : (
        <>{children}</>
      );
    }
  }
};

const RichText = ({ value, className }: Props) => (
  <div className={[styles.richText, className].filter(Boolean).join(' ')}>
    <PortableText value={value} components={components} />
  </div>
);

export default RichText;
