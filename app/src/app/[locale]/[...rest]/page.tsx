import { notFound } from 'next/navigation';

// Unknown paths inside a locale render the localized [locale]/not-found.tsx.
const CatchAllPage = () => {
  notFound();
};

export default CatchAllPage;
