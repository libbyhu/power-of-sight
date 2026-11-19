import { getTranslations } from 'next-intl/server';
import { hasSessionCookie } from '@/lib/session';
import { HeroImage } from '@/components/home/HeroImage';
import { HomeDoors } from '@/components/home/HomeDoors';

export default async function HomePage() {
  const t = await getTranslations('home');
  const signedIn = hasSessionCookie();

  return (
    <div className="flex flex-col items-center gap-10 pb-6 text-center">
      <HeroImage />

      <div className="-mt-6 flex max-w-prose flex-col gap-4">
        <p className="text-balance font-serif text-lg leading-relaxed text-ink sm:text-xl">{t('paragraph1')}</p>
        <p className="text-balance font-serif text-lg leading-relaxed text-ink sm:text-xl">{t('paragraph2')}</p>
        <p className="text-sm leading-relaxed text-ink-soft">{t('roomHint')}</p>
      </div>

      <HomeDoors signedIn={signedIn} />
    </div>
  );
}
