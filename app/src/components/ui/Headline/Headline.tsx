import type { ElementType } from 'react';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import InView from '@/components/ui/InView';
import type { Headline as HeadlineValue } from '@/sanity.types';
import styles from './Headline.module.scss';

type Props = {
  value: HeadlineValue;
  as?: ElementType;
  // One light sweep over the accent phrase when the headline scrolls into view.
  shine?: boolean;
  className?: string;
};

const components: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    accent: ({ children }) => (
      <span className={styles.headline__accent}>{children}</span>
    )
  }
};

const Headline = ({ value, as: Tag = 'h2', shine, className }: Props) => {
  const classNames = [
    styles.headline,
    shine && styles['headline--shine'],
    className
  ]
    .filter(Boolean)
    .join(' ');
  const content = <PortableText value={value} components={components} />;

  return shine ? (
    <InView as={Tag} className={classNames}>
      {content}
    </InView>
  ) : (
    <Tag className={classNames}>{content}</Tag>
  );
};

export default Headline;
