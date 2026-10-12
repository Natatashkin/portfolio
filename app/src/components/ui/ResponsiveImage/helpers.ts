import type { SanityImageSource } from '@sanity/image-url';

export const MOBILE_MAX_WIDTH = 767;

const REF_PATTERN = /^image-[A-Za-z0-9]+-(\d+)x(\d+)-[a-z]+$/;

// A Sanity asset `_ref` encodes the intrinsic size ("image-<id>-1200x800-jpg"),
// which lets the <img> reserve its space without an extra query field.
export const getDimensions = (
  source: SanityImageSource
): { width: number; height: number } | null => {
  if (typeof source !== 'object' || !('asset' in source)) return null;

  const asset = source.asset;
  const ref =
    asset && typeof asset === 'object' && '_ref' in asset ? asset._ref : null;
  const match = typeof ref === 'string' ? REF_PATTERN.exec(ref) : null;

  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
};
