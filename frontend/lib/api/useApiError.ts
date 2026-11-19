'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from './client';

const KNOWN = [
  'EMAIL_TAKEN',
  'INVALID_CREDENTIALS',
  'VALIDATION_FAILED',
  'VERSION_CONFLICT',
  'NOT_FOUND',
  'UNAUTHORIZED',
  'NETWORK',
] as const;

/** 把後端的錯誤代碼翻成目前語言的一句話。 */
export function useApiError() {
  const t = useTranslations('errors');
  // useCallback：讓這個函式在每次畫面更新時保持同一個，避免 useEffect 一直重跑
  return useCallback(
    (error: unknown): string => {
      if (error instanceof ApiError && (KNOWN as readonly string[]).includes(error.code)) {
        return t(error.code as (typeof KNOWN)[number]);
      }
      return t('UNKNOWN');
    },
    [t],
  );
}
