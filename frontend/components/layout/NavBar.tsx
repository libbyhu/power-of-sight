'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname } from '@/lib/i18n/routing';

/**
 * 只有三個入口：首頁、我的書房、願望清單。
 * 願望清單不是另一個地方，而是書房裡「想讀／想看」的篩選。
 */
export function NavBar({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onWishlist = pathname === '/room' && searchParams.get('status') === 'WANT';

  const links = [
    { href: '/', label: t('home'), active: pathname === '/' },
    { href: '/room', label: t('room'), active: pathname.startsWith('/room') && !onWishlist },
    { href: '/room?status=WANT', label: t('wishlist'), active: onWishlist },
  ];

  return (
    <header className="site-header border-b border-edge">
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="font-serif text-lg font-extrabold tracking-wide text-parchment hover:text-amber">
          <span className="mr-1.5 text-amber" aria-hidden>
            ✦
          </span>
          用眼睛發力
        </Link>

        {signedIn && (
          <nav className="hidden gap-6 sm:flex">
            {links.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {signedIn ? (
            <Link href="/settings" aria-label={t('settings')} className="text-muted hover:text-parchment">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" strokeLinecap="round" />
              </svg>
            </Link>
          ) : (
            <Link href="/login" className="text-sm text-muted hover:text-parchment">
              {t('login')}
            </Link>
          )}
          <LanguageSwitch />
        </div>
      </div>

      {signedIn && (
        <nav className="flex items-center justify-around border-t border-edge px-4 py-2 sm:hidden">
          {links.map((link) => (
            <NavLink key={link.href} {...link} small />
          ))}
        </nav>
      )}
    </header>
  );
}

function NavLink({ href, label, active, small }: { href: string; label: string; active: boolean; small?: boolean }) {
  const size = small ? 'text-xs' : 'text-sm';
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={
        active ? `${size} font-medium text-amber` : `${size} text-muted transition-colors hover:text-parchment`
      }
    >
      {label}
    </Link>
  );
}

function LanguageSwitch() {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const href = query ? `${pathname}?${query}` : pathname;

  return (
    <div className="flex gap-2 text-xs text-muted">
      <Link href={href} locale="zh-TW" className="hover:text-parchment">
        中
      </Link>
      <span aria-hidden>/</span>
      <Link href={href} locale="en" className="hover:text-parchment">
        EN
      </Link>
    </div>
  );
}
