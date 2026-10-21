import type { SanityImageSource } from '@sanity/image-url';
import { IMAGE_REF_PATTERN } from '@/lib/constants';

// Reads the intrinsic size from the asset `_ref`, which lets the <img> reserve its space without an
// extra query field.
export const getDimensions = (
  source: SanityImageSource
): { width: number; height: number } | null => {
  if (typeof source !== 'object' || !('asset' in source)) return null;

  const asset = source.asset;
  const ref =
    asset && typeof asset === 'object' && '_ref' in asset ? asset._ref : null;
  const match = typeof ref === 'string' ? IMAGE_REF_PATTERN.exec(ref) : null;

  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
};
