'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { roomApi } from '@/lib/api/client';
import type { LayoutStyle } from '@/lib/api/types';
import { ArtisticDoorArt, TidyDoorArt } from '@/components/room/DoorChooser';

/**
 * 首頁唯一的入口：「歡迎回來」＋兩扇門，底下一行給還沒有書房的人。
 * 已登入：記住這扇門並直接走進書房。
 * 未登入：先登入，登入後帶著這扇門進書房。
 */
export function HomeDoors({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations('home');
  const tDoors = useTranslations('doors');
  const locale = useLocale();
  const [opening, setOpening] = useState<LayoutStyle | null>(null);

  async function enter(style: LayoutStyle) {
    setOpening(style);
    try {
      await roomApi.setLayout(style);
    } catch {
      // 存不了也沒關係，書房裡還能再選一次
    }
    window.location.assign(`/${locale}/room`);
  }

  const doors: { style: LayoutStyle; title: string; art: React.ReactNode }[] = [
    { style: 'TIDY', title: tDoors('tidyTitle'), art: <TidyDoorArt /> },
    { style: 'ARTISTIC', title: tDoors('artisticTitle'), art: <ArtisticDoorArt /> },
  ];

  return (
    <section aria-labelledby="home-doors-title" className="flex w-full max-w-xl flex-col items-center gap-6 pt-4">
      <div className="flex flex-col gap-1">
        <h2 id="home-doors-title" className="font-serif text-2xl text-ink">
          {t('welcomeBack')}
        </h2>
        <p className="text-sm text-ink-soft">{t('chooseRoom')}</p>
      </div>

      <div className="grid w-full grid-cols-2 gap-6 sm:gap-16">
        {doors.map((door) => {
          const inner = (
            <>
              <div className="mx-auto w-28 sm:w-36">{door.art}</div>
              <span className="font-serif text-base text-ink">{door.title}</span>
              <span className="text-xs text-teal underline-offset-4 group-hover:underline">
                {opening === door.style ? '…' : `${tDoors('enter')} →`}
              </span>
            </>
          );
          const className =
            'group flex flex-col items-center gap-2 rounded-card p-2 outline-none focus-visible:ring-2 focus-visible:ring-teal';
          return signedIn ? (
            <button
              key={door.style}
              type="button"
              onClick={() => enter(door.style)}
              disabled={opening !== null}
              className={`${className} disabled:cursor-wait`}
            >
              {inner}
            </button>
          ) : (
            <Link key={door.style} href={{ pathname: '/login', query: { door: door.style } }} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>

      {/* 第三個選項：給第一次來的人 */}
      {!signedIn && (
        <p className="border-t border-line pt-5 text-sm text-ink-soft">
          {t('noRoom')}{' '}
          <Link href="/register" className="font-medium text-teal underline-offset-4 hover:underline">
            {t('createRoom')} →
          </Link>
        </p>
      )}
    </section>
  );
}
