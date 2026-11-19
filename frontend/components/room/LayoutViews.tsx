'use client';

import { useTranslations } from 'next-intl';
import { MEDIA_TYPES, type Entry, type LayoutStyle } from '@/lib/api/types';
import { MediaCard } from '@/components/media/MediaCard';

/** 書房上方的切換鈕：整齊書架 ／ 散落書房。 */
export function LayoutSwitch({
  value,
  onChange,
}: {
  value: LayoutStyle;
  onChange: (style: LayoutStyle) => void;
}) {
  const t = useTranslations('doors');
  const options: { style: LayoutStyle; label: string }[] = [
    { style: 'TIDY', label: t('tidyShort') },
    { style: 'ARTISTIC', label: t('artisticShort') },
  ];
  return (
    <div role="radiogroup" aria-label={t('switchLabel')} className="inline-flex rounded-full border border-line p-0.5 text-sm">
      {options.map((o) => (
        <button
          key={o.style}
          type="button"
          role="radio"
          aria-checked={value === o.style}
          onClick={() => value !== o.style && onChange(o.style)}
          className={
            value === o.style
              ? 'rounded-full bg-ink px-3 py-1 text-paper'
              : 'rounded-full px-3 py-1 text-ink-soft transition-colors hover:text-ink'
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * 整齊書架：依種類分層，層與層之間用細線隔開。
 * 同一層裡的順序由後端依名稱排好（sort=TITLE）。
 */
export function TidyShelves({ entries }: { entries: Entry[] }) {
  const t = useTranslations('types');
  const shelves = MEDIA_TYPES.map((type) => ({ type, items: entries.filter((e) => e.type === type) })).filter(
    (s) => s.items.length > 0,
  );

  return (
    <div className="flex flex-col gap-10">
      {shelves.map((shelf) => (
        <section key={shelf.type} aria-label={t(shelf.type)} className="border-b border-line pb-8 last:border-b-0">
          <h2 className="mb-3 flex items-baseline gap-2 font-serif text-lg text-ink">
            {t(shelf.type)}
            <span className="font-sans text-xs text-ink-soft">{shelf.items.length}</span>
          </h2>
          <div className="grid grid-cols-3 items-start gap-x-3 gap-y-6 px-1 sm:grid-cols-5 md:grid-cols-7">
            {shelf.items.map((entry) => (
              <MediaCard key={entry.id} entry={entry} showType={false} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * 散落書房：不分種類、不排序，最新放進來的在前面。
 * 每本書都站得正正的、排成整齊的一列一列——「散落」指的是內容沒有整理，不是畫面歪斜。
 */
export function ScatteredRoom({ entries }: { entries: Entry[] }) {
  return (
    <div className="grid grid-cols-2 items-start gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
      {entries.map((entry) => (
        <MediaCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
