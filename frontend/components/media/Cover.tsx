/* eslint-disable @next/next/no-img-element */
import type { MediaType } from '@/lib/api/types';

// 沒有封面時，用種類顯示一個淡淡的書背色塊，讓混放的書房也有層次
const spine: Record<MediaType, string> = {
  BOOK: 'bg-[#E4D6B5]',
  MOVIE: 'bg-[#DCD3C0]',
  TV: 'bg-[#D9D8C4]',
  ANIME: 'bg-[#E6D2C4]',
};

/**
 * 封面用一般的 <img>：網址是使用者自己貼的，來源網站不固定，
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
        <div className="flex h-full items-center justify-center px-3 text-center font-serif text-sm leading-snug text-ink-soft">
          {title}
        </div>
      )}
    </div>
  );
}
