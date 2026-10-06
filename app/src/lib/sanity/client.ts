import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from './env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Freshness comes from Next's cache + tag revalidation; the CDN would add a second stale layer.
  useCdn: false
});
