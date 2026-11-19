'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LayoutStyle } from '@/lib/api/types';

/**
 * 第一次走進書房時看到的兩扇門。
 * 選了之後隨時可以在書房上方切換，作品資料不受影響。
 */
export function DoorChooser({ onChoose }: { onChoose: (style: LayoutStyle) => Promise<void> }) {
  const t = useTranslations('doors');
  const [choosing, setChoosing] = useState<LayoutStyle | null>(null);

  async function choose(style: LayoutStyle) {
    setChoosing(style);
    try {
      await onChoose(style);
    } finally {
      setChoosing(null);
    }
  }

  return (
    <section className="flex flex-col items-center gap-10 py-6 text-center">
      <div className="flex max-w-prose flex-col gap-3">
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">{t('title')}</h1>
        <p className="text-sm leading-relaxed text-ink-soft">{t('lead')}</p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-10 sm:grid-cols-2">
        <Door
          style="TIDY"
          title={t('tidyTitle')}
          description={t('tidyDescription')}
          action={t('enter')}
          busy={choosing === 'TIDY'}
          disabled={choosing !== null}
          onClick={() => choose('TIDY')}
        >
          <TidyDoorArt />
        </Door>
        <Door
          style="ARTISTIC"
          title={t('artisticTitle')}
          description={t('artisticDescription')}
          action={t('enter')}
          busy={choosing === 'ARTISTIC'}
          disabled={choosing !== null}
          onClick={() => choose('ARTISTIC')}
        >
          <ArtisticDoorArt />
        </Door>
      </div>

      <p className="text-xs text-ink-soft">{t('switchLater')}</p>
    </section>
  );
}

function Door({
  title,
  description,
  action,
  busy,
  disabled,
  onClick,
  children,
}: {
  style: LayoutStyle;
  title: string;
  description: string;
  action: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col items-center gap-4 rounded-card p-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-wait"
    >
      <div className="w-40 sm:w-44">{children}</div>
      <div className="flex flex-col gap-1">
        <span className="font-serif text-lg text-ink">{title}</span>
        <span className="max-w-[16rem] text-sm leading-relaxed text-ink-soft">{description}</span>
      </div>
      <span className="text-sm text-teal underline-offset-4 group-hover:underline">{busy ? '…' : `${action} →`}</span>
    </button>
  );
}

// 門扇：滑鼠移上去時往左收窄，看起來像微微打開，露出門後的暖光
const leafClass =
  'origin-left transition-transform duration-500 ease-out [transform-box:fill-box] group-hover:[transform:scaleX(0.78)] group-focus-visible:[transform:scaleX(0.78)] motion-reduce:transition-none';

/**
 * 門的圖目前是向量示意圖，首頁和選門畫面共用。
 * 之後有正式插圖時，只要把這兩個元件換成 <Image src="/images/door-tidy.png" … /> 即可。
 */

/** 整齊書架之門：對稱的拱門、四塊方正的門板、置中的把手。 */
export function TidyDoorArt() {
  return (
    <svg viewBox="0 0 160 240" className="h-auto w-full" aria-hidden>
      <defs>
        <radialGradient id="tidy-glow" cx="50%" cy="65%" r="70%">
          <stop offset="0%" stopColor="#F6D58E" />
          <stop offset="100%" stopColor="#B9803F" />
        </radialGradient>
      </defs>
      {/* 石框 */}
      <path d="M8 240 V72 A72 72 0 0 1 152 72 V240 Z" fill="#D9CCB0" stroke="#B5A486" strokeWidth="2" />
      {/* 門後的光 */}
      <path d="M24 240 V78 A56 56 0 0 1 136 78 V240 Z" fill="url(#tidy-glow)" />
      {/* 門後隱約的書架 */}
      <g stroke="#8C5E2E" strokeWidth="3" opacity="0.5">
        <line x1="30" y1="120" x2="130" y2="120" />
        <line x1="30" y1="160" x2="130" y2="160" />
        <line x1="30" y1="200" x2="130" y2="200" />
      </g>
      {/* 門扇 */}
      <g className={leafClass}>
        <path d="M24 240 V78 A56 56 0 0 1 136 78 V240 Z" fill="#6E4B31" stroke="#4F3422" strokeWidth="2" />
        <g fill="none" stroke="#4F3422" strokeWidth="2" opacity="0.8">
          <rect x="36" y="96" width="38" height="56" rx="3" />
          <rect x="86" y="96" width="38" height="56" rx="3" />
          <rect x="36" y="164" width="38" height="62" rx="3" />
          <rect x="86" y="164" width="38" height="62" rx="3" />
        </g>
        <circle cx="80" cy="158" r="5" fill="#C9A24B" stroke="#8C6A24" />
        {/* 門牌 */}
        <rect x="62" y="44" width="36" height="12" rx="2" fill="#3B5941" />
      </g>
    </svg>
  );
}

/** 散落書房之門：歪歪的拱、寬窄不一的木條、爬上門框的藤蔓。 */
export function ArtisticDoorArt() {
  return (
    <svg viewBox="0 0 160 240" className="h-auto w-full -rotate-2" aria-hidden>
      <defs>
        <radialGradient id="art-glow" cx="45%" cy="60%" r="75%">
          <stop offset="0%" stopColor="#F8D08A" />
          <stop offset="100%" stopColor="#A9653A" />
        </radialGradient>
      </defs>
      {/* 不太對稱的石框 */}
      <path d="M12 240 V86 Q10 20 84 14 Q152 12 148 80 V240 Z" fill="#D9CCB0" stroke="#B5A486" strokeWidth="2" />
      {/* 門後的光和散落的書 */}
      <path d="M26 240 V90 Q26 32 84 28 Q134 28 134 86 V240 Z" fill="url(#art-glow)" />
      <g opacity="0.55">
        <rect x="38" y="206" width="30" height="8" rx="1" fill="#7A3B2E" transform="rotate(-8 53 210)" />
        <rect x="70" y="214" width="34" height="8" rx="1" fill="#3B5941" transform="rotate(6 87 218)" />
        <rect x="96" y="196" width="10" height="26" rx="1" fill="#6B4E8A" transform="rotate(14 101 209)" />
      </g>
      {/* 門扇 */}
      <g className={leafClass}>
        <path d="M26 240 V90 Q26 32 84 28 Q134 28 134 86 V240 Z" fill="#8A5A3B" stroke="#5E3A24" strokeWidth="2" />
        <g fill="none" stroke="#5E3A24" strokeWidth="2" opacity="0.75">
          <path d="M46 238 Q44 150 48 62" />
          <path d="M70 238 Q73 140 68 36" />
          <path d="M98 238 Q95 130 100 34" />
          <path d="M118 238 Q121 160 116 56" />
        </g>
        <circle cx="114" cy="150" r="5.5" fill="#C9A24B" stroke="#8C6A24" />
      </g>
      {/* 藤蔓 */}
      <g fill="#5E7F52" stroke="#3F5A37" strokeWidth="1">
        <path d="M14 200 Q4 140 18 92 Q30 46 76 20" fill="none" stroke="#4E6B45" strokeWidth="2.5" />
        <ellipse cx="12" cy="176" rx="6" ry="3.5" transform="rotate(-30 12 176)" />
        <ellipse cx="20" cy="140" rx="6" ry="3.5" transform="rotate(25 20 140)" />
        <ellipse cx="14" cy="112" rx="6" ry="3.5" transform="rotate(-20 14 112)" />
        <ellipse cx="28" cy="72" rx="6" ry="3.5" transform="rotate(30 28 72)" />
        <ellipse cx="44" cy="44" rx="6" ry="3.5" transform="rotate(-10 44 44)" />
        <ellipse cx="62" cy="28" rx="6" ry="3.5" transform="rotate(20 62 28)" />
      </g>
    </svg>
  );
}
