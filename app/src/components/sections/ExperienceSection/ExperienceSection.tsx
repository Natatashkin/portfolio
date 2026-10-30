import clsx from 'clsx';
import Container from '@/components/ui/Container';
import Headline from '@/components/ui/Headline';
import LinkButton from '@/components/ui/LinkButton';
import RichText from '@/components/ui/RichText';
import type { SectionOf } from '@/lib/sanity/types';
import ExperienceCard from './ExperienceCard';
import ExperienceIntro from './ExperienceIntro';
import styles from './ExperienceSection.module.scss';
import ExperienceTimeline from './ExperienceTimeline';

const ExperienceSection = ({
  anchorId,
  eyebrow,
  headline,
  description,
  experiences,
  buttons
}: SectionOf<'experienceSection'>) => {
  const cards = (experiences ?? []).filter(({ company }) => company);
  // `LinkButton` renders nothing without a label, so those must not leave an empty wrapper.
  const actions = (buttons ?? []).filter(({ label }) => label);
  const hasActions = actions.length > 0;
  const hasIntro = Boolean(eyebrow || headline || description || hasActions);
  const hasCards = cards.length > 0;

  if (!hasIntro && !hasCards) return null;

  return (
    <section id={anchorId ?? undefined} className={styles.experience}>
      <Container>
        <div
          className={clsx(
            styles.experience__layout,
            !(hasIntro && hasCards) && styles['experience__layout--single']
          )}
        >
          {hasIntro && (
            <ExperienceIntro className={styles.experience__intro}>
              {eyebrow && (
                <p className={styles.experience__eyebrow}>{eyebrow}</p>
              )}
              {headline && (
                <Headline
                  value={headline}
                  className={styles.experience__headline}
                />
              )}
              {description && (
                <RichText
                  value={description}
                  className={styles.experience__description}
                />
              )}
              {hasActions && (
                <div className={styles.experience__actions}>
                  {actions.map(({ _key, ...button }) => (
                    <LinkButton key={_key} {...button} />
                  ))}
                </div>
              )}
            </ExperienceIntro>
          )}
          {hasCards && (
            <div className={styles.experience__timeline}>
              <ExperienceTimeline>
                {cards.map((experience) => (
                  <ExperienceCard
                    key={experience._id}
                    experience={experience}
                  />
                ))}
              </ExperienceTimeline>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default ExperienceSection;
