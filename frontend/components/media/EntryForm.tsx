'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { useApiError } from '@/lib/api/useApiError';
import { ENTRY_STATUSES, MEDIA_TYPES, type Entry, type EntryInput, type EntryStatus, type MediaType } from '@/lib/api/types';
import { Field, FormMessage, inputClass, primaryButton } from '@/components/ui/Field';
import { HeartPreferencePicker } from './HeartPreferencePicker';

const REVIEW_MAX = 300;

type Draft = {
  type: MediaType;
  title: string;
  originalTitle: string;
  creator: string;
  releaseYear: string;
  coverUrl: string;
  status: EntryStatus | '';
  preference: number | null;
  review: string;
  completedOn: string;
};

function toDraft(entry?: Entry, defaults?: { type?: MediaType; status?: EntryStatus }): Draft {
  return {
    type: entry?.type ?? defaults?.type ?? 'BOOK',
    title: entry?.title ?? '',
    originalTitle: entry?.originalTitle ?? '',
    creator: entry?.creator ?? '',
    releaseYear: entry?.releaseYear?.toString() ?? '',
    coverUrl: entry?.coverUrl ?? '',
    status: entry?.status ?? defaults?.status ?? '',
    preference: entry?.preference ?? null,
    review: entry?.review ?? '',
    completedOn: entry?.completedOn ?? '',
  };
}

/** 表單的文字 → API 要的格式。空白欄位送 null。 */
function toInput(d: Draft): EntryInput {
  const blankToNull = (v: string) => (v.trim() === '' ? null : v.trim());
  return {
    type: d.type,
    title: d.title.trim(),
    originalTitle: blankToNull(d.originalTitle),
    creator: blankToNull(d.creator),
    releaseYear: d.releaseYear ? Number(d.releaseYear) : null,
    coverUrl: blankToNull(d.coverUrl),
    status: d.status === '' ? null : d.status,
    preference: d.preference,
    review: blankToNull(d.review),
    completedOn: d.completedOn || null,
  };
}

/**
 * 新增和編輯共用的表單。只有「種類」和「名稱」必填，
 * 喜好、心得、狀態、完成日期都可以之後再補。
 */
export function EntryForm({
  entry,
  defaults,
  onSubmit,
  submitLabel,
  children,
}: {
  entry?: Entry;
  defaults?: { type?: MediaType; status?: EntryStatus };
  onSubmit: (input: EntryInput) => Promise<void>;
  submitLabel: string;
  /** 放在儲存按鈕旁邊的額外按鈕（例如刪除） */
  children?: React.ReactNode;
}) {
  const t = useTranslations('entry');
  const tTypes = useTranslations('types');
  const tStatus = useTranslations('status');
  const toMessage = useApiError();

  const [draft, setDraft] = useState<Draft>(() => toDraft(entry, defaults));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [conflict, setConflict] = useState(false);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    if (!draft.title.trim()) {
      setFieldErrors({ title: t('titleRequired') });
      return;
    }
    setSaving(true);
    try {
      await onSubmit(toInput(draft));
    } catch (err) {
      if (err instanceof ApiError && err.code === 'VERSION_CONFLICT') setConflict(true);
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(Object.fromEntries(Object.keys(err.fields).map((k) => [k, t('fieldInvalid')])));
      }
      setError(toMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-6" noValidate>
      {/* 種類只決定「作者／導演」這類欄位怎麼稱呼，作品還是放在同一間書房 */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm text-ink-soft">{t('type')}</legend>
        <div className="flex flex-wrap gap-2">
          {MEDIA_TYPES.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => set('type', opt)}
              aria-pressed={draft.type === opt}
              className={
                draft.type === opt
                  ? 'rounded-card bg-teal px-3 py-1.5 text-sm font-medium text-paper'
                  : 'rounded-card border border-line px-3 py-1.5 text-sm text-ink-soft hover:border-teal hover:text-teal'
              }
            >
              {tTypes(opt)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('title')} error={fieldErrors.title}>
          <input value={draft.title} onChange={(e) => set('title', e.target.value)} maxLength={200} className={inputClass} required />
        </Field>
        <Field label={t('originalTitle')} hint={t('optional')}>
          <input value={draft.originalTitle} onChange={(e) => set('originalTitle', e.target.value)} maxLength={200} className={inputClass} />
        </Field>
        <Field label={t(`creator.${draft.type}`)} hint={t('optional')}>
          <input value={draft.creator} onChange={(e) => set('creator', e.target.value)} maxLength={120} className={inputClass} />
        </Field>
        <Field label={t('releaseYear')} hint={t('optional')} error={fieldErrors.releaseYear}>
          <input
            value={draft.releaseYear}
            onChange={(e) => set('releaseYear', e.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
            maxLength={4}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={t('coverUrl')} hint={t('coverUrlHint')} error={fieldErrors.coverUrl}>
        <input
          value={draft.coverUrl}
          onChange={(e) => set('coverUrl', e.target.value)}
          placeholder="https://..."
          maxLength={500}
          className={inputClass}
        />
      </Field>

      <div className="flex flex-col gap-5 rounded-card border border-line p-4">
        <p className="text-xs text-ink-soft">{t('notesHint')}</p>

        <Field label={t('preference')}>
          <HeartPreferencePicker preference={draft.preference} onChange={(p) => set('preference', p)} />
        </Field>

        <Field label={t('review')} error={fieldErrors.review}>
          <textarea
            value={draft.review}
            onChange={(e) => set('review', e.target.value.slice(0, REVIEW_MAX))}
            maxLength={REVIEW_MAX}
            rows={4}
            className={inputClass}
          />
          <span className="self-end text-xs text-ink-soft">
            {draft.review.length} / {REVIEW_MAX}
          </span>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('status')}>
            <select value={draft.status} onChange={(e) => set('status', e.target.value as Draft['status'])} className={inputClass}>
              <option value="">{t('statusNone')}</option>
              {ENTRY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {tStatus(s)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('completedOn')} error={fieldErrors.completedOn}>
            <input
              type="date"
              value={draft.completedOn}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set('completedOn', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {error && (
        <div className="flex flex-col gap-2">
          <FormMessage tone="error">{error}</FormMessage>
          {conflict && (
            <button type="button" onClick={() => window.location.reload()} className="w-fit text-sm text-teal underline">
              {t('reload')}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? t('saving') : submitLabel}
        </button>
        {children}
      </div>
    </form>
  );
}
