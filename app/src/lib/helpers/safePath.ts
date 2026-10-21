import { INTERNAL_PATH_PATTERN } from '@/lib/constants';

export const safePath = (path: string | null | undefined): string | null =>
  path && INTERNAL_PATH_PATTERN.test(path) ? `/${path}` : null;
