'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { roomApi } from '@/lib/api/client';
import { useApiError } from '@/lib/api/useApiError';
import { useSignedOutRedirect } from '@/lib/api/useSignedOutRedirect';
import { Field, FormMessage, inputClass, primaryButton } from '@/components/ui/Field';

type Draft = { name: string; intro: string; quoteText: string; quoteSource: string };

/** 佈置書房：名稱、介紹和一句引言。公開參觀尚未開放，書房目前一律私人。 */
export function RoomEditor() {
  const t = useTranslations('roomEdit');
  const toMessage = useApiError();
  const redirectIfSignedOut = useSignedOutRedirect();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saved, setSaved] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    roomApi
      .get()
      .then((room) => {
        const d = {
          name: room.name,
          intro: room.intro ?? '',
          quoteText: room.quoteText ?? '',
          quoteSource: room.quoteSource ?? '',
        };
        setDraft(d);
        setSaved(d);
      })
      .catch((err) => redirectIfSignedOut(err) || setMessage({ tone: 'error', text: toMessage(err) }));
  }, [redirectIfSignedOut, toMessage]);

  if (!draft) {
    return message ? <FormMessage tone="error">{message.text}</FormMessage> : <p className="text-sm text-muted">…</p>;
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const set = (key: keyof Draft, value: string) => {
    setDraft({ ...draft, [key]: value });
    setMessage(null);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim()) {
      setMessage({ tone: 'error', text: t('nameRequired') });
      return;
    }
    setSaving(true);
    try {
      const room = await roomApi.update({
        name: draft.name.trim(),
        intro: draft.intro.trim() || null,
        quoteText: draft.quoteText.trim() || null,
        quoteSource: draft.quoteSource.trim() || null,
      });
      const d = { name: room.name, intro: room.intro ?? '', quoteText: room.quoteText ?? '', quoteSource: room.quoteSource ?? '' };
      setDraft(d);
      setSaved(d);
      setMessage({ tone: 'ok', text: t('saved') });
    } catch (err) {
      if (!redirectIfSignedOut(err)) setMessage({ tone: 'error', text: toMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex max-w-prose flex-col gap-6">
      <Link href="/room" className="text-sm text-muted hover:text-amber">
        ← {t('back')}
      </Link>
      <h1 className="font-serif text-2xl text-parchment">{t('title')}</h1>

      <Field label={t('name')}>
        <input value={draft.name} onChange={(e) => set('name', e.target.value)} maxLength={60} className={inputClass} />
      </Field>

      <Field label={t('intro')} hint={`${draft.intro.length} / 500`}>
        <textarea
          value={draft.intro}
          onChange={(e) => set('intro', e.target.value.slice(0, 500))}
          placeholder={t('introPlaceholder')}
          rows={4}
          className={inputClass}
        />
      </Field>

      <div className="flex flex-col gap-3 rounded-card border border-edge p-4">
        <div>
          <h2 className="font-serif text-lg text-parchment">{t('quoteTitle')}</h2>
          <p className="mt-1 text-xs text-muted">{t('quoteHint')}</p>
        </div>
        <Field label={t('quoteText')}>
          <textarea
            value={draft.quoteText}
            onChange={(e) => set('quoteText', e.target.value.slice(0, 200))}
            placeholder={t('quotePlaceholder')}
            rows={2}
            className={inputClass}
          />
        </Field>
        <Field label={t('quoteSource')}>
          <input
            value={draft.quoteSource}
            onChange={(e) => set('quoteSource', e.target.value)}
            placeholder={t('quoteSourcePlaceholder')}
            maxLength={100}
            className={inputClass}
          />
        </Field>
      </div>

      <p className="rounded-card border border-edge bg-surface px-3 py-2 text-xs text-muted">{t('privateNotice')}</p>

      <div className="flex items-center gap-3 border-t border-edge pt-4">
        <button type="submit" disabled={!dirty || saving} className={primaryButton}>
          {saving ? t('saving') : t('save')}
        </button>
        {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}
        {!message && dirty && <span className="text-sm text-muted">{t('unsaved')}</span>}
      </div>
    </form>
  );
}
