import Container from '@/components/ui/Container';
import Headline from '@/components/ui/Headline';
import LinkButton from '@/components/ui/LinkButton';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import RichText from '@/components/ui/RichText';
import type { SectionOf } from '@/lib/sanity/types';
import HeroGrid from './HeroGrid';
import HeroMetricNumber from './HeroMetricNumber';
import styles from './HeroSection.module.scss';

const HeroSection = ({
  anchorId,
  role,
  fullname,
  ctaButton,
  description,
  headline,
  image,
  metrics,
  quote,
  stack
}: SectionOf<'heroSection'>) => (
  <section id={anchorId ?? undefined} className={styles.hero}>
    <Container>
      <div className={styles.hero__container}>
        <HeroGrid className={styles.hero__grid} />
        <div className={styles.hero__heading}>
          {role && <p className={styles.hero__role}>{role}</p>}
          {fullname && <h1 className={styles.hero__fullname}>{fullname}</h1>}
        </div>
        <div className={styles.hero__descriptions}>
          {headline && (
            <Headline
              as="p"
              value={headline}
              shine
              className={styles.hero__headline}
            />
          )}
          {description && <RichText value={description} />}
        </div>
        {ctaButton && (
          <div className={styles.hero__actions}>
            <LinkButton {...ctaButton} />
          </div>
        )}
        {stack && stack.length > 0 && (
          <ul className={styles.hero__stack}>
            {stack.map((item) => {
              const label =
                item._type === 'technology' ? item.name : item.title;

              return label ? (
                <li key={item._id} className={styles.hero__stackItem}>
                  {label}
                </li>
              ) : null;
            })}
          </ul>
        )}
        {image?.desktop.asset && (
          <figure className={styles.hero__image}>
            {/* `sizes` mirrors the widths of `.hero__picture` (50vw / 44vw / 33vw, max 400px). */}
            <ResponsiveImage
              desktop={image.desktop}
              mobile={image.mobile?.asset ? image.mobile : null}
              alt={image.alt}
              sizes="(min-width: 1212px) 400px, (min-width: 1024px) 33vw, (min-width: 909px) 400px, (min-width: 768px) 44vw, 50vw"
              priority
              className={styles.hero__picture}
            />
            {quote && (
              <figcaption className={styles.hero__quote}>{quote}</figcaption>
            )}
          </figure>
        )}
        {metrics && metrics.length > 0 && (
          <ul className={styles.hero__metrics}>
            {metrics.map(({ _id, value, label }, index) => (
              <li key={_id} className={styles.hero__metric}>
                <HeroMetricNumber
                  value={value}
                  index={index}
                  className={styles.hero__metricValue}
                />
                {label && <p className={styles.hero__metricLabel}>{label}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  </section>
);

export default HeroSection;
