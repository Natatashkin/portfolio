import clsx from 'clsx';
import Container from '@/components/ui/Container';
import DotGrid from '@/components/ui/DotGrid';
import Headline from '@/components/ui/Headline';
import LinkButton from '@/components/ui/LinkButton';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import RichText from '@/components/ui/RichText';
import type { SectionOf } from '@/lib/sanity/types';
import styles from './CareerSection.module.scss';
import CareerSteps from './CareerSteps';
import CareerText from './CareerText';

// Steps up to this count sit on the cover as cards at fixed positions (`:nth-child` in the SCSS);
// more steps, or no cover to lay them on, fall back to a plain list.
const MAX_OVERLAY_STEPS = 4;

const CareerSection = ({
  anchorId,
  eyebrow,
  headline,
  description,
  steps,
  tagline,
  cover,
  buttons
}: SectionOf<'careerSection'>) => {
  const cards = (steps ?? []).filter(
    ({ period, title, description: text }) => period || title || text
  );
  const hasCover = Boolean(cover?.desktop.asset);
  const isOverlay = hasCover && cards.length <= MAX_OVERLAY_STEPS;
  const hasButtons = Boolean(buttons && buttons.length > 0);
  const hasBody = Boolean(headline || description || hasButtons);
  const hasText = Boolean(eyebrow || hasBody);

  return (
    <section id={anchorId ?? undefined} className={styles.career}>
      <DotGrid className={styles.career__grid} />
      <Container>
        <div className={styles.career__container}>
          {hasText && (
            <div className={styles.career__text}>
              {eyebrow && <p className={styles.career__eyebrow}>{eyebrow}</p>}
              {hasBody && (
                <CareerText className={styles.career__textBody}>
                  {headline && (
                    <Headline
                      value={headline}
                      className={styles.career__headline}
                    />
                  )}
                  {description && (
                    <RichText
                      value={description}
                      className={styles.career__description}
                    />
                  )}
                  {hasButtons && (
                    <div className={styles.career__actions}>
                      {buttons?.map(({ _key, ...button }) => (
                        <LinkButton key={_key} {...button} />
                      ))}
                    </div>
                  )}
                </CareerText>
              )}
            </div>
          )}
          {cards.length > 0 && (
            <CareerSteps steps={cards} variant="mobile" isOverlay={isOverlay} />
          )}
          {(hasCover || cards.length > 0) && (
            <div className={styles.career__media}>
              <div
                className={clsx(
                  styles.career__mediaWrapper,
                  !isOverlay && styles['career__mediaWrapper--plain']
                )}
              >
                {cover && hasCover && (
                  <ResponsiveImage
                    desktop={cover.desktop}
                    mobile={cover.mobile?.asset ? cover.mobile : null}
                    alt={cover.alt}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className={styles.career__picture}
                  />
                )}
                {cards.length > 0 && (
                  <CareerSteps
                    steps={cards}
                    variant="desktop"
                    isOverlay={isOverlay}
                  />
                )}
              </div>
              {tagline && <p className={styles.career__tagline}>{tagline}</p>}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default CareerSection;
