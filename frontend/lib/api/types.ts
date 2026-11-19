// 和 Spring Boot 的 DTO 一一對應（backend/src/main/java/com/powerofsight/dto）

export type MediaType = 'BOOK' | 'MOVIE' | 'TV' | 'ANIME';
export type EntryStatus = 'WANT' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export const MEDIA_TYPES: MediaType[] = ['BOOK', 'MOVIE', 'TV', 'ANIME'];
export const ENTRY_STATUSES: EntryStatus[] = ['WANT', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'];

export type User = {
  id: string;
  email: string;
  displayName: string;
};

export type Room = {
  name: string;
  intro: string | null;
  quoteText: string | null;
  quoteSource: string | null;
  isPublic: boolean;
  updatedAt: string;
};

export type RoomStats = {
  total: number;
  byType: Partial<Record<MediaType, number>>;
  byStatus: Partial<Record<EntryStatus | 'NONE', number>>;
};

export type Entry = {
  id: string;
  type: MediaType;
  title: string;
  originalTitle: string | null;
  creator: string | null;
  releaseYear: number | null;
  coverUrl: string | null;
  status: EntryStatus | null;
  preference: number | null;
  review: string | null;
  completedOn: string | null; // yyyy-mm-dd
  version: number;
  createdAt: string;
  updatedAt: string;
};

/** 新增／修改收藏時送出的內容。只有 type 和 title 必填。 */
export type EntryInput = {
  type: MediaType;
  title: string;
  originalTitle: string | null;
  creator: string | null;
  releaseYear: number | null;
  coverUrl: string | null;
  status: EntryStatus | null;
  preference: number | null;
  review: string | null;
  completedOn: string | null;
  version?: number;
};

export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};
