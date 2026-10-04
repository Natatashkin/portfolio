import { notFound } from "next/navigation";

// Unknown paths inside a locale render the localized [locale]/not-found.tsx.
export default function CatchAllPage() {
  notFound();
}
