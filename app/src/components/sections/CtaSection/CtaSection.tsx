import clsx from 'clsx';
import Container from '@/components/ui/Container';
import Headline from '@/components/ui/Headline';
import LinkButton from '@/components/ui/LinkButton';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import RichText from '@/components/ui/RichText';
import type { SectionOf } from '@/lib/sanity/types';
import styles from './CtaSection.module.scss';

const CtaSection = ({
  anchorId,
  eyebrow,
  headline,
  description,
  hasBackground,
  cover,
  ctaButton,
  buttons,
  layout,
  isFullWidth
}: SectionOf<'ctaSection'>) => {
  // `LinkButton` renders nothing without a label, so those must not leave an empty wrapper.
  const mainButton = ctaButton?.label ? ctaButton : null;
  const extraButtons = (buttons ?? []).filter(({ label }) => label);
  const hasExtraButtons = extraButtons.length > 0;
  const isCentered = layout === 'column-centered';
  // Studio keeps a hidden `cover`, so the toggle decides; without an image the plain variant renders.
  const coverDesktop =
    hasBackground && cover?.desktop?.asset ? cover.desktop : null;

  if (!headline && !description && !mainButton && !hasExtraButtons) return null;

  // Rendered after the content: it is positioned behind it, and the scrim is a pseudo-element painted
  // after every child, so the order only keeps "first child" selectors about the text and buttons.
  const media = coverDesktop && (
    <ResponsiveImage
      className={styles.cta__picture}
      desktop={coverDesktop}
      mobile={cover?.mobile?.asset ? cover.mobile : null}
      alt={cover?.alt ?? null}
      sizes="100vw"
    />
  );
  const extra = extraButtons.map(({ _key, ...button }) => (
    <LinkButton key={_key} {...button} />
  ));
  const main = mainButton && <LinkButton {...mainButton} />;
  const intro = (
    <>
      {eyebrow && <p className={styles.cta__eyebrow}>{eyebrow}</p>}
      {headline && (
        <Headline value={headline} className={styles.cta__headline} />
      )}
      {description && (
        <RichText value={description} className={styles.cta__description} />
      )}
    </>
  );

  return (
    <section
      id={anchorId ?? undefined}
      className={clsx(
        styles.cta,
        isFullWidth && styles['cta--full'],
        coverDesktop && styles['cta--bg'],
        isCentered && styles['cta--centered']
      )}
    >
      <Container>
        <div className={styles.cta__panel}>
          {isCentered ? (
            <>
              {intro}
              {(hasExtraButtons || main) && (
                <div className={styles.cta__actions}>
                  {extra}
                  {main}
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.cta__body}>
                {intro}
                {hasExtraButtons && (
                  <div className={styles.cta__actions}>{extra}</div>
                )}
              </div>
              {main && <div className={styles.cta__main}>{main}</div>}
            </>
          )}
          {!isFullWidth && media}
        </div>
      </Container>
      {isFullWidth && media}
    </section>
  );
};

export default CtaSection;
