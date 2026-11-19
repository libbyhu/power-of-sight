'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/routing';
import { entryApi } from '@/lib/api/client';
import type { Entry } from '@/lib/api/types';
import { useApiError } from '@/lib/api/useApiError';
import { useSignedOutRedirect } from '@/lib/api/useSignedOutRedirect';
import { Cover } from '@/components/media/Cover';
import { EntryForm } from '@/components/media/EntryForm';
import { FormMessage } from '@/components/ui/Field';

export function EntryDetail({ id }: { id: string }) {
  const t = useTranslations('entry');
  const tTypes = useTranslations('types');
  const router = useRouter();
  const toMessage = useApiError();
  const redirectIfSignedOut = useSignedOutRedirect();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    entryApi
      .get(id)
      .then(setEntry)
      .catch((err) => redirectIfSignedOut(err) || setLoadError(toMessage(err)));
  }, [id, redirectIfSignedOut, toMessage]);

  async function handleDelete() {
    try {
      await entryApi.remove(id);
      router.push('/room');
      router.refresh();
    } catch (err) {
      if (!redirectIfSignedOut(err)) setDeleteError(toMessage(err));
    }
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-3">
        <FormMessage tone="error">{loadError}</FormMessage>
        <Link href="/room" className="text-sm text-amber hover:underline">
          ← {t('backToRoom')}
        </Link>
      </div>
    );
  }
  if (!entry) return <p className="text-sm text-muted">{t('loading')}</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/room" className="text-sm text-muted hover:text-amber">
        ← {t('backToRoom')}
      </Link>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[200px_1fr]">
        <div className="w-full max-w-[200px]">
          <Cover url={entry.coverUrl} title={entry.title} type={entry.type} />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted/80">{tTypes(entry.type)}</p>
            <h1 className="font-serif text-2xl text-parchment">{entry.title}</h1>
            {entry.originalTitle && <p className="text-sm text-muted">{entry.originalTitle}</p>}
          </div>

          {/* key 換掉時表單會用最新資料重新建立（儲存後 version 會 +1） */}
          <EntryForm
            key={entry.version}
            entry={entry}
            submitLabel={t('saveButton')}
            onSubmit={async (input) => {
              try {
                const updated = await entryApi.update(entry.id, { ...input, version: entry.version });
                setEntry(updated);
                setSavedAt(Date.now());
              } catch (err) {
                if (redirectIfSignedOut(err)) return;
                throw err;
              }
            }}
          >
            {savedAt && <FormMessage tone="ok">{t('saved')}</FormMessage>}
            <div className="ml-auto flex items-center gap-2">
              {confirmDelete ? (
                <>
                  <span className="text-sm text-muted">{t('deleteConfirm')}</span>
                  <button type="button" onClick={handleDelete} className="rounded-card bg-heart px-3 py-1.5 text-sm text-on-amber">
                    {t('deleteYes')}
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="text-sm text-muted hover:text-parchment">
                    {t('deleteNo')}
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="text-sm text-muted hover:text-heart">
                  {t('delete')}
                </button>
              )}
            </div>
          </EntryForm>
          {deleteError && <FormMessage tone="error">{deleteError}</FormMessage>}
        </div>
      </div>
    </div>
  );
}
