import type { SectionOf } from '@/components/sections/SectionRenderer';
import { Container } from '@/components/ui/Container';
import styles from './HeroSection.module.scss';

const HeroSection = ({
  anchorId,
  role,
  fullname,
  tagline
}: SectionOf<'heroSection'>) => (
  <section id={anchorId ?? undefined} className={styles.hero}>
    <Container>
      {role && <p className={styles.role}>{role}</p>}
      {fullname && <h1 className={styles.fullname}>{fullname}</h1>}
      {tagline && <p className={styles.tagline}>{tagline}</p>}
    </Container>
  </section>
);

export default HeroSection;
