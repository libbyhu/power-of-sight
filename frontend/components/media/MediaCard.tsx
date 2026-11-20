import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import type { Entry } from '@/lib/api/types';
import { Cover } from './Cover';
import { HeartPreference } from './HeartPreference';
import { StatusBadge } from './StatusBadge';
import { TypeGlyph } from './TypeGlyph';

/** 書房裡的一部作品：有邊框、底下一條深木色底座的卡片。 */
export function MediaCard({ entry }: { entry: Entry }) {
  const t = useTranslations('types');

  return (
    <Link
      href={`/room/${entry.id}`}
      className="group flex flex-col gap-2 rounded-card border border-b-4 border-edge border-b-wood bg-surface p-2 transition-colors hover:border-amber hover:border-b-wood"
    >
      <Cover url={entry.coverUrl} title={entry.title} type={entry.type} />

      <div className="flex flex-col gap-1 px-0.5 pb-1">
        <p className="flex items-center gap-1.5 text-[11px] tracking-wider text-muted/80">
          <TypeGlyph type={entry.type} />
          {t(entry.type)}
        </p>
        <p className="font-serif text-sm leading-snug text-parchment group-hover:text-amber">{entry.title}</p>
        {entry.originalTitle && <p className="text-xs text-muted">{entry.originalTitle}</p>}
        {entry.creator && <p className="text-xs text-muted">{entry.creator}</p>}
        <HeartPreference preference={entry.preference} />
        <div className="mt-0.5">
          <StatusBadge status={entry.status} />
        </div>
      </div>
    </Link>
  );
}
