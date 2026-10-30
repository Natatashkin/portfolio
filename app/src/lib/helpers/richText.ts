import type { RichText } from '@/sanity.types';

// The items a rich text reports: its bullets; its plain paragraphs when it has no bullets.
export const countRichTextItems = (value: RichText): number => {
  const bullets = value.filter(({ listItem }) => listItem === 'bullet');

  return bullets.length > 0 ? bullets.length : value.length;
};
