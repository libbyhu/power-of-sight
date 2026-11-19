import { useTranslations } from 'next-intl';
import type { EntryStatus } from '@/lib/api/types';

const styles: Record<EntryStatus, string> = {
  WANT: 'bg-paper-dim text-ink-soft',
  IN_PROGRESS: 'bg-teal/10 text-teal-dark',
  COMPLETED: 'bg-teal text-paper',
  ABANDONED: 'bg-paper-dim text-ink-soft line-through',
};

/** 沒填狀態就什麼都不顯示。 */
export function StatusBadge({ status }: { status: EntryStatus | null }) {
  const t = useTranslations('status');
  if (!status) return null;

  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${styles[status]}`}>{t(status)}</span>;
}
