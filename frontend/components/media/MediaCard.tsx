import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import type { Entry } from '@/lib/api/types';
import { Cover } from './Cover';
import { HeartPreference } from './HeartPreference';
import { StatusBadge } from './StatusBadge';

/** showType=false：整齊書架上每一層已經寫了種類，卡片上就不再重複。 */
export function MediaCard({ entry, showType = true }: { entry: Entry; showType?: boolean }) {
  const t = useTranslations('types');

  return (
    <Link href={`/room/${entry.id}`} className="group flex flex-col gap-2 rounded-card transition-opacity hover:opacity-90">
      <Cover url={entry.coverUrl} title={entry.title} type={entry.type} />

      <div className="flex flex-col gap-1">
        {/* 種類只是小小的標示，不是分類 */}
        {showType && <p className="text-[11px] uppercase tracking-wider text-ink-soft/70">{t(entry.type)}</p>}
        <p className="font-serif text-sm leading-snug text-ink">{entry.title}</p>
        {entry.originalTitle && <p className="text-xs text-ink-soft">{entry.originalTitle}</p>}
        {entry.creator && <p className="text-xs text-ink-soft">{entry.creator}</p>}
        <HeartPreference preference={entry.preference} />
        <div className="mt-0.5">
          <StatusBadge status={entry.status} />
        </div>
      </div>
    </Link>
  );
}
