import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import ExperienceEntry from '@/components/sections/ExperienceSection/ExperienceEntry';
import type { ExperienceItem } from '@/components/sections/ExperienceSection/types';
import RichText from '@/components/ui/RichText';
import TagList from '@/components/ui/TagList';
import { countRichTextItems, formatMonth, toTagItems } from '@/lib/helpers';
import styles from './ExperienceCard.module.scss';

type Props = {
  experience: ExperienceItem;
};

// One company: its date range and marker on the timeline rail, then the card. The outer `li` is never
// animated; the wrapper inside it (date, marker and card) is what the reveal moves.
const ExperienceCard = ({ experience }: Props) => {
  const t = useTranslations('ExperienceSection');
  const locale = useLocale();
  const { company, role, logo, periodStart, periodEnd, companyDescription } =
    experience;
  // GROQ returns null for an entry list a document does not have, although the schema requires one.
  const entries = experience.entries ?? [];

  const start = formatMonth(periodStart, locale);
  const end = periodEnd ? formatMonth(periodEnd, locale) : t('present');
  // An SVG is not optimized by next/image.
  const isSvg = Boolean(logo?.url.endsWith('.svg'));

  return (
    <li className={styles.item}>
      <div className={styles.item__inner} data-reveal>
        {start && (
          <p className={styles.item__period}>
            <time className={styles.item__start} dateTime={periodStart}>
              {start}
            </time>
            <br />
            {periodEnd && end ? <time dateTime={periodEnd}>{end}</time> : end}
          </p>
        )}
        <span className={styles.item__rail} aria-hidden="true">
          <span className={styles.item__marker} />
        </span>
        <div className={styles.card}>
          <div className={styles.card__header}>
            {logo && (
              <div className={styles.card__logo}>
                {logo.width && logo.height ? (
                  <Image
                    className={styles.card__logoImage}
                    src={logo.url}
                    width={logo.width}
                    height={logo.height}
                    alt={company ?? ''}
                    unoptimized={isSvg}
                  />
                ) : (
                  <Image
                    className={styles.card__logoImage}
                    src={logo.url}
                    fill
                    sizes="56px"
                    alt={company ?? ''}
                    unoptimized={isSvg}
                  />
                )}
              </div>
            )}
            <div className={styles.card__info}>
              {company && <h3 className={styles.card__company}>{company}</h3>}
              {role && <p className={styles.card__role}>{role}</p>}
              {companyDescription && (
                <RichText
                  value={companyDescription}
                  className={styles.card__description}
                />
              )}
            </div>
          </div>
          {entries.length > 0 && (
            <ul className={styles.card__entries}>
              {entries.map(({ _key, title, description, technologies }) => {
                if (!title) return null;

                const tags = toTagItems(technologies);
                const text = description?.length ? description : null;
                const hasBody = tags.length > 0 || text !== null;

                return (
                  <li key={_key}>
                    <ExperienceEntry
                      title={title}
                      count={text ? countRichTextItems(text) : 0}
                    >
                      {hasBody && (
                        <>
                          <TagList tags={tags} />
                          {text && (
                            <RichText
                              value={text}
                              className={styles.card__entryText}
                            />
                          )}
                        </>
                      )}
                    </ExperienceEntry>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
};

export default ExperienceCard;
