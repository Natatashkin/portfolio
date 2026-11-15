import { useTranslations } from 'next-intl';
import type { ProjectCardItem } from '@/components/sections/ProjectsSection/types';
import LinkButton from '@/components/ui/LinkButton';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import RichText from '@/components/ui/RichText';
import TagList from '@/components/ui/TagList';
import { Link } from '@/i18n/navigation';
import { safePath, toTagItems } from '@/lib/helpers';
import styles from './ProjectCard.module.scss';

type Props = {
  project: ProjectCardItem;
};

// The `sizes` hint mirrors the grid: a full row on mobile, half from `md`, a third from `lg`.
const IMAGE_SIZES = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw';

// The card is not a link: the title, the preview's About button (pointer devices only), Live and GitHub
// are separate controls, so no interactive element is nested in another.
const ProjectCard = ({ project }: Props) => {
  const t = useTranslations('ProjectsSection');
  const { title, slug, summary, image, technologies, buttons } = project;
  const tags = toTagItems(technologies);
  const detailsPath = safePath(`projects/${slug}`);
  // A button without a label or a URL is not configured: it leaves no empty slot.
  const actions = (buttons ?? []).filter(({ label, url }) => label && url);

  return (
    <li className={styles.card}>
      {image && (
        <div className={styles.card__media}>
          <ResponsiveImage
            className={styles.card__picture}
            desktop={image.desktop}
            mobile={image.mobile}
            alt={image.alt}
            sizes={IMAGE_SIZES}
          />
          {/* A sibling of the picture, so the blur does not reach the button. */}
          <div className={styles.card__overlay}>
            <LinkButton
              linkType="internal"
              // url={`projects/${slug}`}
              // TEMPORARY: `#` until the page `projects/[slug]` exists.
              url="#"
              label={t('about')}
              // Three cards, three "About" links: the name says which project.
              ariaLabel={t('aboutProject', { title })}
              variant="outlined"
            />
          </div>
        </div>
      )}
      <div className={styles.card__header}>
        <h3 className={styles.card__title}>
          {detailsPath ? (
            <Link
              className={styles.card__titleLink}
              // href={detailsPath}
              // TEMPORARY: `#` until the page `projects/[slug]` exists.
              href="#"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {actions.length > 0 && (
          <div className={styles.card__actions}>
            {/* The kind of a button is read from its icon, never from its position in the array. */}
            {actions.map(({ _key, ...button }) => (
              <LinkButton
                key={_key}
                {...button}
                // Always a web link: Studio defaults a new button to `internal`, which would drop a full URL.
                linkType="external"
                size="compact"
                hasIcon
                variant={button.iconKey === 'github' ? 'outlined' : 'accent'}
              />
            ))}
          </div>
        )}
      </div>
      {summary && <RichText value={summary} className={styles.card__summary} />}
      {tags.length > 0 && (
        <div className={styles.card__stack}>
          <TagList className={styles.card__tags} tags={tags} />
        </div>
      )}
    </li>
  );
};

export default ProjectCard;
