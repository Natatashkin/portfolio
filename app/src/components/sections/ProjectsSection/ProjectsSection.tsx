import Container from '@/components/ui/Container';
import Headline from '@/components/ui/Headline';
import LinkButton from '@/components/ui/LinkButton';
import RichText from '@/components/ui/RichText';
import type { SectionOf } from '@/lib/sanity/types';
import ProjectCard from './ProjectCard';
import styles from './ProjectsSection.module.scss';
import type { ProjectCardItem, ProjectItem } from './types';

const hasTitleAndSlug = (project: ProjectItem): project is ProjectCardItem =>
  Boolean(project.title && project.slug);

const ProjectsSection = ({
  anchorId,
  eyebrow,
  headline,
  description,
  projects,
  button
}: SectionOf<'projectsSection'>) => {
  // A card needs a title and a slug: the title names it, the slug is the link to its page.
  const cards = (projects ?? []).filter(hasTitleAndSlug);
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
