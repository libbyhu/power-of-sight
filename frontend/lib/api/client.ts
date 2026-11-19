import type { Entry, EntryInput, EntryStatus, LayoutStyle, MediaType, Page, Room, RoomStats, User } from './types';

/** 後端回傳的錯誤。code 對應 messages/*.json 裡的 errors.* 翻譯。 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public fields?: Record<string, string>,
  ) {
    super(code);
  }
}

type RequestOptions = { method?: string; json?: unknown };

/**
 * 所有 API 呼叫都經過這裡。網址是相對路徑 /api/...，
 * 由 next.config.js 的 rewrites 轉給 Spring Boot，登入 cookie 會自動帶上。
 */
async function request<T>(path: string, { method = 'GET', json }: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: json === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: json === undefined ? undefined : JSON.stringify(json),
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(0, 'NETWORK');
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // 後端沒開時，Next.js 的轉址會回 500 而且沒有 JSON
    const code = data?.code ?? (res.status >= 500 ? 'NETWORK' : 'UNKNOWN');
    throw new ApiError(res.status, code, data?.fields);
  }
  return data as T;
}

export const authApi = {
  register: (body: { email: string; password: string; displayName: string }) =>
    request<User>('/auth/register', { method: 'POST', json: body }),
  login: (body: { email: string; password: string }) =>
    request<User>('/auth/login', { method: 'POST', json: body }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  me: () => request<User>('/auth/me'),
};

export const roomApi = {
  get: () => request<Room>('/me/room'),
  update: (body: { name: string; intro: string | null; quoteText: string | null; quoteSource: string | null }) =>
    request<Room>('/me/room', { method: 'PUT', json: body }),
  setLayout: (layoutStyle: LayoutStyle) =>
    request<Room>('/me/room/layout', { method: 'PUT', json: { layoutStyle } }),
  stats: () => request<RoomStats>('/me/room/stats'),
};

export type EntryFilters = {
  type?: MediaType | null;
  status?: EntryStatus | null;
  q?: string;
  /** RECENT：最新放的在前；TITLE：依種類、名稱排列 */
  sort?: 'RECENT' | 'TITLE';
  page?: number;
  size?: number;
};

export const entryApi = {
  list: ({ type, status, q, sort = 'RECENT', page = 0, size = 24 }: EntryFilters = {}) => {
    const params = new URLSearchParams({ sort, page: String(page), size: String(size) });
    if (type) params.set('type', type);
    if (status) params.set('status', status);
    if (q?.trim()) params.set('q', q.trim());
    return request<Page<Entry>>(`/me/entries?${params}`);
  },
  get: (id: string) => request<Entry>(`/me/entries/${encodeURIComponent(id)}`),
  create: (body: EntryInput) => request<Entry>('/me/entries', { method: 'POST', json: body }),
  update: (id: string, body: EntryInput) =>
    request<Entry>(`/me/entries/${encodeURIComponent(id)}`, { method: 'PUT', json: body }),
  remove: (id: string) => request<void>(`/me/entries/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
