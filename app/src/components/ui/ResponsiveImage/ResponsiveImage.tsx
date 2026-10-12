import Image, { getImageProps } from 'next/image';
import type { SanityImageSource } from '@sanity/image-url';
import { urlFor } from '@/lib/sanity/image';
import { getDimensions, MOBILE_MAX_WIDTH } from './helpers';
import styles from './ResponsiveImage.module.scss';

type Props = {
  desktop: SanityImageSource;
  mobile?: SanityImageSource | null;
  alt: string | null;
  // `sizes` hint for both images: how wide the picture renders, including any
  // CSS max-width cap, e.g. '(min-width: 1024px) 400px, 50vw'.
  sizes?: string;
  // Raises fetch priority of the matching image. Not next/image `preload`: its
  // <link> ignores <source media> and would also fetch the desktop image on mobile.
  priority?: boolean;
  className?: string;
};

const ResponsiveImage = ({
  desktop,
  mobile,
  alt,
  sizes = '100vw',
  priority = false,
  className
}: Props) => {
  const desktopSize = getDimensions(desktop);

  if (!desktopSize) return null;

  const mobileSize = mobile ? getDimensions(mobile) : null;
  const mobileSrcSet =
    mobile && mobileSize
      ? getImageProps({
          ...mobileSize,
          alt: '',
          src: urlFor(mobile).url(),
          sizes
        }).props.srcSet
      : null;

  return (
    <picture className={className}>
      {mobileSrcSet && (
        <source
          media={`(max-width: ${MOBILE_MAX_WIDTH}px)`}
          srcSet={mobileSrcSet}
          sizes={sizes}
        />
      )}
      <Image
        className={styles.responsiveImage__img}
        src={urlFor(desktop).url()}
        {...desktopSize}
        alt={alt ?? ''}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  );
};

export default ResponsiveImage;
