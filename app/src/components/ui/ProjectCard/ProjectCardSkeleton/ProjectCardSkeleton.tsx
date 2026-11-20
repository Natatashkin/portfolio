import clsx from 'clsx';
import cardStyles from '@/components/ui/ProjectCard/ProjectCard.module.scss';
import styles from './ProjectCardSkeleton.module.scss';

// Holds the place of a `ProjectCard` in the grid while the list streams in. The box, the preview frame, the
// summary height and the tag block come from the card's own classes, so the swap shifts nothing; this file only
// adds the grey bones. No text and nothing to focus, so it is hidden from assistive technology.
const ProjectCardSkeleton = () => (
  <li className={clsx(cardStyles.card, styles.skeleton)} aria-hidden="true">
    <div className={cardStyles.card__media}>
      <span className={styles.skeleton__fill} />
    </div>
    <div className={cardStyles.card__header}>
      <span className={styles.skeleton__title} />
      <span className={styles.skeleton__action} />
    </div>
    <div className={cardStyles.card__summary}>
      <span className={styles.skeleton__line} />
      <span className={styles.skeleton__line} />
      <span className={styles.skeleton__line} />
      <span className={styles.skeleton__line} />
    </div>
    <div className={cardStyles.card__stack}>
      <div className={clsx(cardStyles.card__tags, styles.skeleton__tags)}>
        <span className={styles.skeleton__tag} />
        <span className={styles.skeleton__tag} />
        <span className={styles.skeleton__tag} />
        <span className={styles.skeleton__tag} />
      </div>
    </div>
  </li>
);

export default ProjectCardSkeleton;
