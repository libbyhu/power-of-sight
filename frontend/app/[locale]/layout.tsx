import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { hasSessionCookie } from '@/lib/session';
import { NavBar } from '@/components/layout/NavBar';
import '../globals.css';

export const metadata: Metadata = {
  title: '用眼睛發力 · Power of Sight',
  description: 'A personal room for everything you have read and watched.',
  manifest: '/manifest.json',
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
};

// 手機瀏覽器上方工具列的顏色
export const viewport: Viewport = { themeColor: '#15121a' };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-night font-sans text-parchment antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
            <NavBar signedIn={hasSessionCookie()} />
            <main className="flex-1 px-5 py-8 sm:px-8">{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
