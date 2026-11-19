import Image from 'next/image';
import { getLocale } from 'next-intl/server';

/**
 * 首頁主視覺：月光魔法書庫（像素 RPG 風格的靜態圖）。
 * 圖的下緣慢慢淡進紙張色，像從門口走進書房，接上下面的內頁風格。
 * 之後要做「小旅人推門進書庫」的動畫，只需要替換這個元件。
 */
export async function HeroImage() {
  const zh = (await getLocale()) === 'zh-TW';
  return (
    <figure className="relative w-full overflow-hidden rounded-card bg-[#1f1d2b]">
      <Image
        src="/images/magic-library-moonlight.webp"
        alt={
          zh
            ? '月光灑進古老魔法書庫，沙發暖燈照著讀者與貓；四周散落書堆、盆栽、水晶和藥水瓶，小旅人停在石階旁的木門前。'
            : 'Moonlight enters an ancient magical library. A warm lamp lights a reader and cats among scattered books, plants, crystals and potion bottles; a traveler stands by the wooden doorway.'
        }
        width={1672}
        height={941}
        sizes="(max-width: 1024px) 100vw, 960px"
        priority
        className="block h-auto w-full"
      />
      {/* 下緣淡入紙張色 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-paper via-paper/40 to-transparent" />
    </figure>
  );
}
