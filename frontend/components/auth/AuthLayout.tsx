import Image from 'next/image';

/** 登入／註冊頁：左邊是表單，右邊放第一版就有的手繪插圖。 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-10 py-4 md:grid-cols-[1fr_1.1fr]">
      <div className="flex justify-center md:justify-start">{children}</div>
      <div className="relative hidden overflow-hidden rounded-card md:block">
        <Image
          src="/images/hero.jpg"
          alt=""
          width={1942}
          height={809}
          className="h-auto w-full"
          style={{ filter: 'sepia(8%) saturate(0.82) contrast(0.96) brightness(1.02)' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-teal opacity-[0.05] mix-blend-multiply" />
      </div>
    </div>
  );
}
