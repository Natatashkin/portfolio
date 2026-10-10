import type { SectionOf } from '@/components/sections/SectionRenderer';
import styles from './HeroSection.module.scss';

export function HeroSection({
  anchorId,
  role,
  fullname,
  tagline
}: SectionOf<'heroSection'>) {
  return (
    <section id={anchorId ?? undefined} className={styles.hero}>
      {role && <p className={styles.role}>{role}</p>}
      {fullname && <h1 className={styles.fullname}>{fullname}</h1>}
      {tagline && <p className={styles.tagline}>{tagline}</p>}
    </section>
  );
}
