import type { LinkButton } from '@/sanity.types';

type LinkButtonField =
  'linkType' | 'url' | 'hasAnchor' | 'anchor' | 'variant' | 'hasIcon';

// Field types come from the Studio schema (TypeGen); GROQ returns an empty field as `null`.
// `label`, `fileUrl` and `fileName` are resolved in GROQ: the localized label as a string, the file
// from `download.document->files[download.language]` (read only for `linkType: download`, D15).
export type LinkButtonProps = {
  [Key in LinkButtonField]?: NonNullable<LinkButton[Key]> | null;
} & {
  label?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
};
