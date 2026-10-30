// Month and year in the page locale, without the punctuation some locales add and with a capital first
// letter ("лип. 2025 р." becomes "Лип 2025"). The date is a calendar day without a time zone, so it is read
// as UTC and formatted as UTC: the local zone must not move it into the previous month.
export const formatMonth = (date: string, locale: string): string | null => {
  const value = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(value.getTime())) return null;

  const text = new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  })
    .formatToParts(value)
    .filter(({ type }) => type === 'month' || type === 'year')
    .map(({ value: part }) => part.replaceAll('.', ''))
    .join(' ');

  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
};
