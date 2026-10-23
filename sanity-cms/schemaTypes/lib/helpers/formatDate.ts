/** Stored ISO date (YYYY-MM-DD) as DD-MM-YYYY, for document list previews. */
export const formatDate = (iso: string): string => iso.split('-').reverse().join('-')
