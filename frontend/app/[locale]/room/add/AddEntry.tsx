'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/lib/i18n/routing';
import { entryApi } from '@/lib/api/client';
import { ENTRY_STATUSES, MEDIA_TYPES, type EntryStatus, type MediaType } from '@/lib/api/types';
import { useSignedOutRedirect } from '@/lib/api/useSignedOutRedirect';
import { EntryForm } from '@/components/media/EntryForm';

export function AddEntry() {
  const t = useTranslations('entry');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectIfSignedOut = useSignedOutRedirect();

  // 從「願望清單」或某個種類篩選按新增時，先幫忙選好
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const defaults = {
    type: MEDIA_TYPES.includes(type as MediaType) ? (type as MediaType) : undefined,
    status: ENTRY_STATUSES.includes(status as EntryStatus) ? (status as EntryStatus) : undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-ink">{t('addTitle')}</h1>
      <EntryForm
        defaults={defaults}
        submitLabel={t('addButton')}
        onSubmit={async (input) => {
          try {
            await entryApi.create(input);
          } catch (err) {
            if (redirectIfSignedOut(err)) return;
            throw err;
          }
          router.push(defaults.status === 'WANT' ? '/room?status=WANT' : '/room');
          router.refresh();
        }}
      />
    </div>
  );
}
