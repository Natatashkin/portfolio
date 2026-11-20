import type { LinkButton } from '@/sanity.types';

type LinkButtonField =
  | 'linkType'
  | 'url'
  | 'hasAnchor'
  | 'anchor'
  | 'variant'
  | 'hasIcon'
  | 'iconKey';

// Field types come from the Studio schema (TypeGen); GROQ returns an empty field as `null`.
// `label`, `fileUrl` and `fileName` are resolved in GROQ: the localized label as a string, the file
// from `download.document->files[download.language]` (read only for `linkType: download`).
// Why: docs/features/ui-blocks.md (Decisions).
export type LinkButtonProps = {
  [Key in LinkButtonField]?: NonNullable<LinkButton[Key]> | null;
} & {
  // `compact` is a smaller pill for places where the button sits beside other content (a card).
  size?: 'default' | 'compact';
  // Replaces the accessible name, which must still contain the visible label (WCAG 2.5.3). On an external
  // link it also replaces the hidden "opens in a new tab" hint, so use it on internal links.
  ariaLabel?: string;
  label?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
};
