import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

const handleI18nRouting = createIntlMiddleware(routing);

// 需要登入才能看的頁面
const PROTECTED = /^\/(zh-TW|en)\/(room|settings)(\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 這裡只檢查「有沒有登入 cookie」，讓沒登入的人直接被帶到登入頁。
  // 真正的身分驗證在 Spring Boot：cookie 是假的或過期，API 一律回 401。
  if (PROTECTED.test(pathname) && !request.cookies.get('pos_token')?.value) {
    const locale = pathname.split('/')[1];
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  // 不處理 /api（轉給後端）、Next.js 內部檔案和靜態檔
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
