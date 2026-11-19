/* eslint-disable @next/next/no-img-element */
import type { MediaType } from '@/lib/api/types';

// 沒有封面時，依種類給一個低彩度的深色書背，
// 讓混放的書房在深色背景上仍有層次。
const spine: Record<MediaType, string> = {
  BOOK: 'bg-[#4a2f2c]',
  MOVIE: 'bg-[#2f2a38]',
  TV: 'bg-[#2b3330]',
  ANIME: 'bg-[#3b2b38]',
};

/**
 * 封面用一般的 <img>：網址是會員自己貼的，來源網站不固定，
 * next/image 需要事先列出允許的網域，不適合這裡。
 */
export function Cover({ url, title, type }: { url: string | null; title: string; type: MediaType }) {
  return (
    <div className={`relative aspect-[2/3] w-full overflow-hidden rounded-card ${spine[type]}`}>
      {url ? (
        <img
          src={url}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-3 text-center font-serif text-sm leading-snug text-muted">
          {title}
        </div>
      )}
      {/* 細細的內框，讓封面像一個放在架上的物件 */}
      <div className="pointer-events-none absolute inset-0 border border-parchment/10" />
    </div>
  );
}
