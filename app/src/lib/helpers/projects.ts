import type { ProjectItem } from '@/lib/sanity/types';

// A card needs a title and a slug: the title names it, the slug is the link to its page. The narrowed type is the
// same as `ProjectCardItem` (not imported from the component, which imports these helpers).
export const isProjectCardItem = (
  project: ProjectItem
): project is ProjectItem & { title: string; slug: string } =>
  Boolean(project.title && project.slug);
