'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname, useRouter } from '@/lib/i18n/routing';
import { entryApi, roomApi } from '@/lib/api/client';
import { useApiError } from '@/lib/api/useApiError';
import { useSignedOutRedirect } from '@/lib/api/useSignedOutRedirect';
import {
  ENTRY_STATUSES,
  MEDIA_TYPES,
  type Entry,
  type EntryStatus,
  type MediaType,
  type Room,
  type RoomStats,
} from '@/lib/api/types';
import { MediaCard } from '@/components/media/MediaCard';
import { TypeGlyph } from '@/components/media/TypeGlyph';
import { Eyebrow, FormMessage, inputClass, primaryButton, secondaryButton } from '@/components/ui/Field';

const PAGE_SIZE = 24;
type Sort = 'RECENT' | 'TITLE';

function parseType(v: string | null): MediaType | null {
  return MEDIA_TYPES.includes(v as MediaType) ? (v as MediaType) : null;
}
function parseStatus(v: string | null): EntryStatus | null {
  return ENTRY_STATUSES.includes(v as EntryStatus) ? (v as EntryStatus) : null;
}

/**
 * 我的書房：所有作品放在同一間。
 * 種類、狀態、關鍵字、排序都只是「篩選」，而且會寫進網址（?type=BOOK&sort=TITLE），
 * 所以重新整理或按上一頁都會留在同一個畫面。
 */
export function RoomView() {
  const t = useTranslations('room');
  const tTypes = useTranslations('types');
  const tStatus = useTranslations('status');
  const toMessage = useApiError();
  const redirectIfSignedOut = useSignedOutRedirect();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const type = parseType(searchParams.get('type'));
  const status = parseStatus(searchParams.get('status'));
  const q = searchParams.get('q') ?? '';
  const sort: Sort = searchParams.get('sort') === 'TITLE' ? 'TITLE' : 'RECENT';

  const [room, setRoom] = useState<Room | null>(null);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(q);

  // 網址的 q 被別的地方改掉（例如按導覽列）時，搜尋框跟著更新。
  // 在 render 時比對上一次的 q，不用 effect，避免多一次重新渲染。
  const [syncedQ, setSyncedQ] = useState(q);
  if (q !== syncedQ) {
    setSyncedQ(q);
    setSearch(q);
  }

  // 書房名稱、介紹、統計：進來時讀一次
  useEffect(() => {
    Promise.all([roomApi.get(), roomApi.stats()])
      .then(([r, s]) => {
        setRoom(r);
        setStats(s);
      })
      .catch((err) => redirectIfSignedOut(err) || setError(toMessage(err)));
  }, [redirectIfSignedOut, toMessage]);

  // 每次讀取都編號：快速切換篩選時，舊的請求可能比較晚回來，只採用最新那一次的結果
  const requestId = useRef(0);

  const load = useCallback(
    async (nextPage: number) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const result = await entryApi.list({ type, status, q, sort, page: nextPage, size: PAGE_SIZE });
        if (id !== requestId.current) return;
        setEntries((prev) => (nextPage === 0 ? result.items : [...prev, ...result.items]));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
      } catch (err) {
        if (id !== requestId.current) return;
        if (!redirectIfSignedOut(err)) setError(toMessage(err));
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [type, status, q, sort, redirectIfSignedOut, toMessage],
  );

  // 篩選條件改變 → 從第一頁重新讀
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 向後端讀資料前先顯示載入中；過期的回應由 requestId 排除
    load(0);
  }, [load]);

  // 搜尋框停止輸入 0.3 秒後才更新網址，不要每打一個字就查一次
  useEffect(() => {
    if (search === q) return;
    const timer = setTimeout(() => updateFilter('q', search.trim() || null), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function updateFilter(key: 'type' | 'status' | 'q' | 'sort', value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const filtered = Boolean(type || status || q);
  const addHref = status === 'WANT' ? '/room/add?status=WANT' : type ? `/room/add?type=${type}` : '/room/add';

  return (
    <div className="flex flex-col gap-8">
      {/* 書房門牌 */}
      <section className="flex flex-col gap-3 border-b border-edge pb-6">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-parchment sm:text-4xl">{room?.name ?? ' '}</h1>
            {room?.intro && <p className="max-w-prose text-sm leading-relaxed text-muted">{room.intro}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/room/edit" className={secondaryButton}>
              {t('decorate')}
            </Link>
            <Link href={addHref} className={primaryButton}>
              + {t('add')}
            </Link>
          </div>
        </div>
        {room?.quoteText && (
          <blockquote className="max-w-prose border-l-2 border-amber pl-3 font-serif text-base text-parchment">
            「{room.quoteText}」
            {room.quoteSource && <span className="ml-2 text-xs text-muted">— {room.quoteSource}</span>}
          </blockquote>
        )}
        {stats && stats.total > 0 && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span>{t('statsTotal', { count: stats.total })}</span>
            {MEDIA_TYPES.filter((m) => stats.byType[m]).map((m) => (
              <span key={m} className="inline-flex items-center gap-1.5">
                <TypeGlyph type={m} />
                {tTypes(m)} {stats.byType[m]}
              </span>
            ))}
          </p>
        )}
      </section>

      {/* 篩選：不選就是全部混在一起 */}
      <section className="flex flex-col gap-3" aria-label={t('filters')}>
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={!type} onClick={() => updateFilter('type', null)}>
            {t('allTypes')}
          </Chip>
          {MEDIA_TYPES.map((m) => (
            <Chip key={m} active={type === m} onClick={() => updateFilter('type', type === m ? null : m)}>
              {tTypes(m)}
            </Chip>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <TabLink active={!status} onClick={() => updateFilter('status', null)}>
              {t('allStatuses')}
            </TabLink>
            {ENTRY_STATUSES.map((s) => (
              <TabLink key={s} active={status === s} onClick={() => updateFilter('status', status === s ? null : s)}>
                {tStatus(s)}
              </TabLink>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value === 'TITLE' ? 'TITLE' : null)}
              aria-label={t('sortLabel')}
              className={inputClass}
            >
              <option value="RECENT">{t('sortRecent')}</option>
              <option value="TITLE">{t('sortTitle')}</option>
            </select>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              aria-label={t('search')}
              className={`${inputClass} w-full sm:w-60`}
            />
          </div>
        </div>
      </section>

      {error && <FormMessage tone="error">{error}</FormMessage>}

      {!loading && entries.length === 0 && !error ? (
        <div className="flex flex-col items-start gap-3 py-8">
          <p className="text-sm text-muted">{filtered ? t('emptyFiltered') : t('empty')}</p>
          {!filtered && (
            <Link href="/room/add" className={primaryButton}>
              + {t('addFirst')}
            </Link>
          )}
        </div>
      ) : (
        <>
          {filtered && <p className="-mt-4 text-xs text-muted">{t('resultCount', { count: totalItems })}</p>}
          <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {entries.map((entry) => (
              <MediaCard key={entry.id} entry={entry} />
            ))}
          </div>
        </>
      )}

      {loading && <p className="text-sm text-muted">{t('loading')}</p>}
      {!loading && page + 1 < totalPages && (
        <button onClick={() => load(page + 1)} className={`${secondaryButton} self-center`}>
          {t('loadMore')}
        </button>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'rounded-card border border-amber bg-amber px-3 py-1 text-sm font-bold text-on-amber shadow-pixel'
          : 'rounded-card border border-edge bg-surface px-3 py-1 text-sm text-muted transition-colors hover:border-amber hover:text-amber'
      }
    >
      {children}
    </button>
  );
}

function TabLink({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'border-b-2 border-amber pb-0.5 font-medium text-amber'
          : 'border-b-2 border-transparent pb-0.5 text-muted hover:text-parchment'
      }
    >
      {children}
    </button>
  );
}
