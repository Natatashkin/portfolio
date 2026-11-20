import type { ProjectItem } from '@/lib/sanity/types';

export type { ProjectItem };

// A project that can be shown: the title names the card, the slug is the link to its page.
export type ProjectCardItem = ProjectItem & { title: string; slug: string };
