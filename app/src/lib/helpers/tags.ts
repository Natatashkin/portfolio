import type { TagItem } from '@/components/ui/TagList';

// A technology or a skill as the page query returns it; extra fields (`iconKey`) are ignored.
type TagSource = { _id: string } & (
  | { _type: 'technology'; name: string }
  | { _type: 'skill'; title: string | null }
);

// Text for each technology or skill; one without a label is dropped.
export const toTagItems = (items: TagSource[] | null): TagItem[] =>
  (items ?? []).flatMap((item) => {
    const label = item._type === 'technology' ? item.name : item.title;

    return label ? [{ id: item._id, label }] : [];
  });
