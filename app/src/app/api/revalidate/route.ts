import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { PAGE_QUERY_TAGS, SITE_SETTING_QUERY_TAGS } from '@/lib/sanity/queries';

type WebhookPayload = { _type?: string };

// Sanity document type -> cache tag. Types not listed here use their own name,
// which is how `PAGE_QUERY_TAGS` is built.
const TAG_BY_TYPE: Record<string, string> = {
  siteSettings: 'site-settings'
};

const KNOWN_TAGS: ReadonlySet<string> = new Set([
  ...PAGE_QUERY_TAGS,
  ...SITE_SETTING_QUERY_TAGS
]);

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { message: 'Revalidation is not configured' },
      { status: 500 }
    );
  }

  let parsed: Awaited<ReturnType<typeof parseBody<WebhookPayload>>>;

  try {
    parsed = await parseBody<WebhookPayload>(req, secret);
  } catch {
    return NextResponse.json({ message: 'Invalid body' }, { status: 400 });
  }

  if (!parsed.isValidSignature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  const type = parsed.body?._type;

  if (!type) {
    return NextResponse.json({ message: 'Missing _type' }, { status: 400 });
  }

  const tag = TAG_BY_TYPE[type] ?? type;

  // A signed webhook for an unrelated type is not an error: answering 4xx
  // would make Sanity retry a delivery that has nothing to do.
  if (!KNOWN_TAGS.has(tag)) {
    return NextResponse.json({ revalidated: null });
  }

  // `expire: 0`: an editor opening the site right after publishing must not see stale content.
  revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ revalidated: tag });
}
