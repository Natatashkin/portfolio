import clsx from 'clsx';
import styles from './TagList.module.scss';
import type { TagItem } from './types';

type Props = {
  tags: TagItem[];
  // Placement in the parent (grid area, alignment); the chips look the same everywhere.
  className?: string;
};

const TagList = ({ tags, className }: Props) =>
  tags.length > 0 ? (
    <ul className={clsx(styles.tagList, className)}>
      {tags.map(({ id, label }) => (
        <li key={id} className={styles.tagList__item}>
          {label}
        </li>
      ))}
    </ul>
  ) : null;

export default TagList;
