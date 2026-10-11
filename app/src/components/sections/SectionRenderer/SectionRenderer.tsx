import { HeroSection } from '@/components/sections/HeroSection';
import type { Section } from './SectionRenderer.types';

type Props = { sections: Section[] };

// Maps a section's `_type` to its component. Unknown types render nothing,
// so a section added in Studio before its component exists never breaks the page.
export const SectionRenderer = ({ sections }: Props) =>
  sections.map((section) => {
    switch (section._type) {
      case 'heroSection':
        return <HeroSection key={section._key} {...section} />;
      default:
        return null;
    }
  });
