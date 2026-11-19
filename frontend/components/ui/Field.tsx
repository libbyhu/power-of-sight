export const inputClass =
  'rounded-card border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-teal focus:outline-none';

export const primaryButton =
  'rounded-card bg-teal px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-teal-dark disabled:opacity-50';

export const secondaryButton =
  'rounded-card border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-teal hover:text-teal';

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
      <span className="text-ink-soft">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-ink-soft/70">{hint}</span>}
      {error && <span className="text-xs text-heart">{error}</span>}
    </label>
  );
}

export function FormMessage({ tone, children }: { tone: 'error' | 'ok'; children: React.ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={tone === 'error' ? 'text-sm text-heart' : 'text-sm text-teal'}
    >
      {children}
    </p>
  );
}
