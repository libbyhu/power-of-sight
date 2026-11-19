import { useTranslations } from 'next-intl';
import type { EntryStatus } from '@/lib/api/types';

const styles: Record<EntryStatus, string> = {
  WANT: 'border border-moon/60 text-moon',
  IN_PROGRESS: 'bg-moss text-parchment',
  COMPLETED: 'bg-amber text-on-amber',
  ABANDONED: 'border border-edge text-muted line-through',
};

/** 沒填狀態就什麼都不顯示。 */
export function StatusBadge({ status }: { status: EntryStatus | null }) {
  const t = useTranslations('status');
  if (!status) return null;

  return <span className={`inline-block rounded-card px-2 py-0.5 text-xs ${styles[status]}`}>{t(status)}</span>;
}
