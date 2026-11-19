// 喜好程度用愛心表示：代表這部作品對使用者有多重要，而不是替作品打分數。
export function HeartPreference({ preference }: { preference: number | null }) {
  if (!preference) return null;

  return (
    <div className="flex gap-0.5 text-heart" aria-label={`${preference} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < preference ? '' : 'opacity-30'}>
          {i < preference ? '♥' : '♡'}
        </span>
      ))}
    </div>
  );
}
