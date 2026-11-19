// 共用的表單與按鈕樣式。方角加 2px 硬邊陰影，呼應像素場景；
// 琥珀色只給每個畫面最主要的那個操作。

export const inputClass =
  'rounded-card border border-edge bg-surface px-3 py-2 text-sm text-parchment placeholder:text-muted/50 focus:border-amber focus:outline-none';

export const primaryButton =
  'inline-flex min-h-[40px] items-center justify-center rounded-card border border-amber bg-amber px-5 py-2 text-sm font-bold text-on-amber shadow-pixel transition-colors hover:border-parchment hover:bg-parchment disabled:opacity-50';

export const secondaryButton =
  'inline-flex min-h-[40px] items-center justify-center rounded-card border border-edge bg-surface px-4 py-2 text-sm text-parchment shadow-pixel transition-colors hover:border-amber hover:text-amber';

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-muted/70">{hint}</span>}
      {error && <span className="text-xs text-heart">{error}</span>}
    </label>
  );
}

export function FormMessage({ tone, children }: { tone: 'error' | 'ok'; children: React.ReactNode }) {
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={tone === 'error' ? 'text-sm text-heart' : 'text-sm text-amber'}>
      {children}
    </p>
  );
}

/** 標題上方的小字標籤（例如 POWER OF SIGHT）。 */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs tracking-[0.18em] text-amber">{children}</p>;
}
