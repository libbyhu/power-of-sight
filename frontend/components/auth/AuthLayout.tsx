import { getTranslations } from 'next-intl/server';
import { CastleScene } from '@/components/home/CastleScene';

/** 登入／註冊頁：左邊是表單，右邊是古堡交誼廳的靜態畫面。 */
export async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('intro');
  return (
    <div className="grid items-center gap-10 py-4 md:grid-cols-[1fr_1.3fr]">
      <div className="flex justify-center md:justify-start">{children}</div>
      <div className="hidden md:block">
        <CastleScene label={t('stillAlt')} />
      </div>
    </div>
  );
}
