import { cookies } from 'next/headers';

/**
 * 伺服器端用：瀏覽器有沒有帶登入 cookie。
 * 只用來決定畫面顯示「登入」還是「我的書房」，不代表 token 一定有效。
 */
export function hasSessionCookie() {
  return Boolean(cookies().get('pos_token')?.value);
}
