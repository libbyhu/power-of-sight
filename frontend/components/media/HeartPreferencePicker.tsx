'use client';

/** 再點一次同一顆愛心可以取消（喜好程度是選填）。 */
export function HeartPreferencePicker({
  preference,
  onChange,
}: {
  preference: number | null;
  onChange: (p: number | null) => void;
}) {
  return (
    <div className="flex gap-1 text-xl text-heart">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(preference === i + 1 ? null : i + 1)}
          className={i < (preference ?? 0) ? '' : 'opacity-30 hover:opacity-60'}
          aria-label={`${i + 1} / 5`}
          aria-pressed={i < (preference ?? 0)}
        >
          {i < (preference ?? 0) ? '♥' : '♡'}
        </button>
      ))}
    </div>
  );
}
