import { DEFAULT_API_VERSION } from './apiVersion';

const assertValue = <T>(value: T | undefined, name: string): T => {
  if (value === undefined || value === '') {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

// NEXT_PUBLIC_* values are inlined at build time, so each one must be read by its literal name.
export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'NEXT_PUBLIC_SANITY_PROJECT_ID'
);

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'NEXT_PUBLIC_SANITY_DATASET'
);

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || DEFAULT_API_VERSION;
