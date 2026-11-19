import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { LayoutStyle } from '@/lib/api/types';

const banners: Record<LayoutStyle, { src: string; width: number; height: number }> = {
  // 整齊書架：一整排站得直直的書，依顏色排好
  TIDY: { src: '/images/room-tidy.webp', width: 1200, height: 396 },
  // 散落書房：首頁月光書庫的中央——沙發、書堆、地毯
  ARTISTIC: { src: '/images/room-scattered.webp', width: 1740, height: 658 },
};

/** 書房最上方的圖：走進哪一扇門，就看到那間書房的樣子。下緣淡進紙張色。 */
export function RoomBanner({ layout }: { layout: LayoutStyle }) {
  const t = useTranslations('doors');
  const banner = banners[layout];
  return (
    <figure className="relative h-40 w-full overflow-hidden rounded-card bg-[#1f1d2b] sm:h-56">
      <Image
        key={layout}
        src={banner.src}
        alt={layout === 'TIDY' ? t('tidyBannerAlt') : t('artisticBannerAlt')}
        width={banner.width}
        height={banner.height}
        sizes="(max-width: 1024px) 100vw, 960px"
        priority
        className="h-full w-full object-cover [image-rendering:pixelated]"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-paper via-paper/30 to-transparent" />
    </figure>
  );
}
