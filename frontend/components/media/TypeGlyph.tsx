import type { MediaType } from '@/lib/api/types';

/**
 * 每種作品的像素小圖示：書背、底片、螢幕。
 * 只用 CSS 方塊畫出來，不需要圖檔。
 */
const shapes: Record<MediaType, string> = {
  BOOK: 'h-3.5 w-2.5 border-l-[3px] border-l-parchment bg-brick',
  MOVIE: 'h-3 w-4 bg-[repeating-linear-gradient(90deg,#824c48_0_3px,#21191d_3px_5px)]',
  TV: 'h-3 w-4 border-2 border-amber bg-moss',
  ANIME: 'h-3 w-4 border-2 border-moon bg-[#3a3550]',
};

export function TypeGlyph({ type }: { type: MediaType }) {
  return <span aria-hidden className={`inline-block shrink-0 shadow-[2px_2px_0_#422723] ${shapes[type]}`} />;
}
