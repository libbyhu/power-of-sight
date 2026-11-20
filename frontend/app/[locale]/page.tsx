import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { hasSessionCookie } from '@/lib/session';
import { CastleIntro } from '@/components/home/CastleIntro';
import { Eyebrow, primaryButton, secondaryButton } from '@/components/ui/Field';

export default async function HomePage() {
  const t = await getTranslations('home');
  const signedIn = await hasSessionCookie();

  return (
    <div className="flex flex-col gap-14 pb-10">
      <CastleIntro />

      {/* 動畫播放時這一區會先隱藏（見 globals.css 的 intro-playing） */}
      <section className="home-content flex flex-col items-center gap-4 text-center">
        <Eyebrow>POWER OF SIGHT</Eyebrow>
        <h1 className="text-5xl font-extrabold tracking-[0.08em] text-parchment sm:text-7xl">用眼睛發力</h1>
        <p className="text-muted">{t('tagline')}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {signedIn ? (
            <Link href="/room" className={primaryButton}>
              {t('enterRoom')}
            </Link>
          ) : (
            <>
              <Link href="/register" className={primaryButton}>
                {t('createRoom')}
              </Link>
              <Link href="/login" className={secondaryButton}>
                {t('signIn')}
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="home-content mx-auto flex w-full max-w-3xl flex-col gap-4 border-t border-edge pt-10">
        <Eyebrow>{t('aboutEyebrow')}</Eyebrow>
        <h2 className="text-3xl font-extrabold text-parchment sm:text-4xl">{t('aboutTitle')}</h2>
        <p className="text-balance font-serif text-lg leading-relaxed text-parchment">{t('paragraph1')}</p>
        <p className="text-balance font-serif text-lg leading-relaxed text-parchment">{t('paragraph2')}</p>
        <p className="leading-relaxed text-muted">{t('roomHint')}</p>
      </section>
    </div>
  );
}
