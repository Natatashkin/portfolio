import Container from '@/components/ui/Container';
import Headline from '@/components/ui/Headline';
import LinkButton from '@/components/ui/LinkButton';
import ProjectCard from '@/components/ui/ProjectCard';
import RichText from '@/components/ui/RichText';
import { isProjectCardItem } from '@/lib/helpers';
import type { SectionOf } from '@/lib/sanity/types';
import styles from './ProjectsSection.module.scss';

const ProjectsSection = ({
  anchorId,
  eyebrow,
  headline,
  description,
  projects,
  button
}: SectionOf<'projectsSection'>) => {
  const cards = (projects ?? []).filter(isProjectCardItem);
  const hasIntro = Boolean(eyebrow || headline || description);

  if (!hasIntro && cards.length === 0) return null;

  return (
    <section id={anchorId ?? undefined} className={styles.projects}>
      <Container>
        {hasIntro && (
          <div className={styles.projects__intro}>
            {eyebrow && <p className={styles.projects__eyebrow}>{eyebrow}</p>}
            {headline && (
              <Headline
                value={headline}
                className={styles.projects__headline}
              />
            )}
            {description && (
              <RichText
                value={description}
                className={styles.projects__description}
              />
            )}
          </div>
        )}
        {cards.length > 0 && (
          <ul className={styles.projects__grid}>
            {cards.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </ul>
        )}
        {button?.label && (
          <div className={styles.projects__actions}>
            <LinkButton {...button} />
          </div>
        )}
      </Container>
    </section>
  );
};

export default ProjectsSection;
