'use client';

import { useLayoutEffect } from 'react';
import { useIsMounted } from '@/hooks/useIsMounted';
import { restoreTheme, themeScript } from '@/lib/theme/theme';

// Keeps the chosen theme on <html> in two situations.
//
// 1. Document load: the inline script must reach the page in the server HTML and run before the
//    first paint. React never executes a <script> rendered on the client and logs an error for it,
//    which happens when a locale switch re-renders the root layout. `useIsMounted` is false while
//    the server renders and while hydrating, and true for any later client render, so the script is
//    emitted only for the first.
// 2. Locale switch: React remounts the root layout and clears the attributes it does not own on
//    <html>, and the script does not run again. The layout effect puts the stored theme back
//    before paint, once per mount of the root layout.
const ThemeScript = () => {
  const isMounted = useIsMounted();

  useLayoutEffect(() => {
    restoreTheme();
  }, []);

  if (isMounted) return null;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
};

export default ThemeScript;
