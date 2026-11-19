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
  type LayoutStyle,
  type MediaType,
  type Room,
  type RoomStats,
} from '@/lib/api/types';
import { DoorChooser } from '@/components/room/DoorChooser';
import { LayoutSwitch, ScatteredRoom, TidyShelves } from '@/components/room/LayoutViews';
import { RoomBanner } from '@/components/room/RoomBanner';
import { FormMessage, inputClass, primaryButton, secondaryButton } from '@/components/ui/Field';

// 整齊書架一次多讀一些，書架才不會只排一半
const PAGE_SIZE: Record<LayoutStyle, number> = { TIDY: 60, ARTISTIC: 24 };

function parseType(v: string | null): MediaType | null {
  return MEDIA_TYPES.includes(v as MediaType) ? (v as MediaType) : null;
}
function parseStatus(v: string | null): EntryStatus | null {
  return ENTRY_STATUSES.includes(v as EntryStatus) ? (v as EntryStatus) : null;
}

/**
 * 我的書房。第一次進來先選一扇門（整齊書架／散落書房），之後隨時可以切換。
 * 種類、狀態、關鍵字都只是「篩選」，而且會寫進網址（?type=BOOK），
 * 所以重新整理或按上一頁都會留在同一個篩選。
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

  const [room, setRoom] = useState<Room | null>(null);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(q);
  const layout = room?.layoutStyle ?? null;

  // 書房名稱、介紹、統計：進來時讀一次
  useEffect(() => {
    Promise.all([roomApi.get(), roomApi.stats()])
      .then(([r, s]) => {
        setRoom(r);
        setStats(s);
      })
      .catch((err) => redirectIfSignedOut(err) || setError(toMessage(err)));
  }, [redirectIfSignedOut, toMessage]);

  // 從首頁的門（註冊／登入後）帶著 ?door= 進來：書房讀到後就走進那扇門，再把參數從網址拿掉
  const roomLoaded = room !== null;
  useEffect(() => {
    const door = searchParams.get('door');
    if (!room || (door !== 'TIDY' && door !== 'ARTISTIC')) return;
    if (room.layoutStyle !== door) chooseLayout(door);
    updateFilter('door', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomLoaded]);

  // 篩選條件改變 → 從第一頁重新讀
  // 每次讀取都編號：換門或改篩選時，可能有舊的請求比較晚回來，只採用最新那一次的結果
  const requestId = useRef(0);

  const load = useCallback(
    async (nextPage: number) => {
      if (!layout) return;
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const result = await entryApi.list({
          type,
          status,
          q,
          sort: layout === 'TIDY' ? 'TITLE' : 'RECENT',
          page: nextPage,
          size: PAGE_SIZE[layout],
        });
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
    [layout, type, status, q, redirectIfSignedOut, toMessage],
  );

  useEffect(() => {
    load(0);
  }, [load]);

  // 網址的 q 被別的地方改掉（例如按導覽列）時，搜尋框跟著更新
  useEffect(() => {
    setSearch(q);
  }, [q]);

  // 搜尋框停止輸入 0.3 秒後才更新網址，不要每打一個字就查一次
  useEffect(() => {
    if (search === q) return;
    const timer = setTimeout(() => updateFilter('q', search.trim() || null), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // 走進另一扇門：畫面先換，後端存失敗再換回來
  async function chooseLayout(style: LayoutStyle) {
    if (!room) return;
    const previous = room;
    setRoom({ ...room, layoutStyle: style });
    try {
      setRoom(await roomApi.setLayout(style));
    } catch (err) {
      setRoom(previous);
      if (!redirectIfSignedOut(err)) setError(toMessage(err));
    }
  }

  function updateFilter(key: 'type' | 'status' | 'q' | 'door', value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const filtered = Boolean(type || status || q);
  const addHref = status === 'WANT' ? '/room/add?status=WANT' : type ? `/room/add?type=${type}` : '/room/add';

  if (room && !layout && !searchParams.get('door')) {
    return (
      <>
        {error && <FormMessage tone="error">{error}</FormMessage>}
        <DoorChooser onChoose={chooseLayout} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {layout && <RoomBanner layout={layout} />}

      {/* 書房門牌 */}
      <section className="flex flex-col gap-3 border-b border-line pb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-2xl text-ink sm:text-3xl">{room?.name ?? ' '}</h1>
            {room?.intro && <p className="max-w-prose text-sm leading-relaxed text-ink-soft">{room.intro}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {layout && <LayoutSwitch value={layout} onChange={chooseLayout} />}
            <Link href="/room/edit" className={secondaryButton}>
              {t('decorate')}
            </Link>
            <Link href={addHref} className={primaryButton}>
              + {t('add')}
            </Link>
          </div>
        </div>
        {room?.quoteText && (
          <blockquote className="max-w-prose font-serif text-base italic text-ink">
            「{room.quoteText}」
            {room.quoteSource && <span className="ml-2 text-xs not-italic text-ink-soft">— {room.quoteSource}</span>}
          </blockquote>
        )}
        {stats && stats.total > 0 && (
          <p className="text-xs text-ink-soft">
            {t('statsTotal', { count: stats.total })}
            {MEDIA_TYPES.filter((m) => stats.byType[m]).map((m) => (
              <span key={m}>
                {' · '}
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
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            aria-label={t('search')}
            className={`${inputClass} sm:w-64`}
          />
        </div>
      </section>

      {error && <FormMessage tone="error">{error}</FormMessage>}

      {!loading && entries.length === 0 && !error ? (
        <div className="flex flex-col items-start gap-3 py-8">
          <p className="text-sm text-ink-soft">{filtered ? t('emptyFiltered') : t('empty')}</p>
          {!filtered && (
            <Link href="/room/add" className={primaryButton}>
              + {t('addFirst')}
            </Link>
          )}
        </div>
      ) : (
        <>
          {filtered && <p className="-mt-4 text-xs text-ink-soft">{t('resultCount', { count: totalItems })}</p>}
          {layout === 'TIDY' ? <TidyShelves entries={entries} /> : <ScatteredRoom entries={entries} />}
        </>
      )}

      {loading && <p className="text-sm text-ink-soft">{t('loading')}</p>}
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
          ? 'rounded-full bg-teal px-3 py-1 text-sm text-paper'
          : 'rounded-full border border-line px-3 py-1 text-sm text-ink-soft transition-colors hover:border-teal hover:text-teal'
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
          ? 'border-b-2 border-teal pb-0.5 font-medium text-teal'
          : 'border-b-2 border-transparent pb-0.5 text-ink-soft hover:text-ink'
      }
    >
      {children}
    </button>
  );
}
