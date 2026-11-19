'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/routing';
import { authApi } from '@/lib/api/client';
import type { User } from '@/lib/api/types';
import { useSignedOutRedirect } from '@/lib/api/useSignedOutRedirect';
import { secondaryButton } from '@/components/ui/Field';

export function SettingsView() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const pathname = usePathname();
  const redirectIfSignedOut = useSignedOutRedirect();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authApi.me().then(setUser).catch(redirectIfSignedOut);
  }, [redirectIfSignedOut]);

  async function handleLogout() {
    await authApi.logout().catch(() => undefined);
    window.location.assign(`/${locale}`);
  }

  return (
    <div className="flex max-w-prose flex-col gap-8">
      <h1 className="font-serif text-2xl text-parchment">{t('title')}</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">{t('account')}</h2>
        {user && (
          <p className="text-sm text-parchment">
            {user.displayName} · <span className="text-muted">{user.email}</span>
          </p>
        )}
        <button onClick={handleLogout} className={`${secondaryButton} w-fit`}>
          {t('logout')}
        </button>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">{t('language')}</h2>
        <div className="flex gap-3 text-sm">
          {(['zh-TW', 'en'] as const).map((l) => (
            <Link
              key={l}
              href={pathname}
              locale={l}
              className={`rounded-card border px-3 py-1.5 ${l === locale ? 'border-amber text-amber' : 'border-edge hover:border-amber'}`}
            >
              {l === 'zh-TW' ? '中文' : 'English'}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">{t('privacy')}</h2>
        <p className="text-sm text-parchment">{t('privacyNote')}</p>
      </section>
    </div>
  );
}
