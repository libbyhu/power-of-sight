'use client';

import { useLocale } from 'next-intl';
import { useCallback } from 'react';
import { ApiError } from './client';

/** API 回 401（cookie 過期或無效）時，帶使用者回登入頁，登入後再回到這一頁。 */
export function useSignedOutRedirect() {
  const locale = useLocale();
  return useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        const next = window.location.pathname + window.location.search;
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- 整頁重新載入，讓伺服器端重新讀取登入 cookie
        window.location.assign(`/${locale}/login?next=${encodeURIComponent(next)}`);
        return true;
      }
      return false;
    },
    [locale],
  );
}
