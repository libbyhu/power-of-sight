'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';
import { ApiError, authApi } from '@/lib/api/client';
import { useApiError } from '@/lib/api/useApiError';
import { Field, FormMessage, inputClass, primaryButton } from '@/components/ui/Field';

/** 只允許跳回自己網站的頁面，避免被利用成轉址到外部網站。 */
function safeNext(next: string | null, locale: string) {
  return next && /^\/(zh-TW|en)\/[^/]/.test(next) ? next : `/${locale}/room`;
}

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const toMessage = useApiError();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      if (mode === 'register') {
        await authApi.register({ email, password, displayName });
      } else {
        await authApi.login({ email, password });
      }
      // 整頁重新載入：讓伺服器端的導覽列也讀到新的登入 cookie
      window.location.assign(safeNext(searchParams.get('next'), locale));
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(
          Object.fromEntries(Object.keys(err.fields).map((k) => [k, t(`invalid.${k}` as 'invalid.email')])),
        );
      }
      setError(toMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4" noValidate>
      <h1 className="font-serif text-2xl text-parchment">{mode === 'login' ? t('loginTitle') : t('registerTitle')}</h1>
      <p className="text-sm text-muted">{mode === 'login' ? t('loginLead') : t('registerLead')}</p>

      {mode === 'register' && (
        <Field label={t('displayName')} error={fieldErrors.displayName}>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            autoComplete="nickname"
            required
            className={inputClass}
          />
        </Field>
      )}

      <Field label={t('email')} error={fieldErrors.email}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          required
          className={inputClass}
        />
      </Field>

      <Field
        label={t('password')}
        hint={mode === 'register' ? t('passwordHint') : undefined}
        error={fieldErrors.password}
      >
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={mode === 'register' ? 8 : undefined}
          maxLength={72}
          required
          className={inputClass}
        />
      </Field>

      {error && <FormMessage tone="error">{error}</FormMessage>}

      <button type="submit" disabled={submitting} className={primaryButton}>
        {submitting ? t('submitting') : mode === 'login' ? t('loginButton') : t('registerButton')}
      </button>

      <p className="text-sm text-muted">
        {mode === 'login' ? t('noAccount') : t('haveAccount')}{' '}
        <Link href={mode === 'login' ? '/register' : '/login'} className="text-amber hover:underline">
          {mode === 'login' ? t('toRegister') : t('toLogin')}
        </Link>
      </p>
    </form>
  );
}
