const withNextIntl = require('next-intl/plugin')('./lib/i18n/request.ts');

// Spring Boot 後端的位置。本機預設 8080；部署時用環境變數 BACKEND_URL 指定。
const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:8080';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 明確指定專案根目錄，避免 Turbopack 誤用上層資料夾的 package-lock.json
  turbopack: { root: __dirname },

  // 瀏覽器只跟 Next.js 說話：/api/* 由 Next.js 轉給 Spring Boot。
  // 好處是前後端在同一個網址底下，登入 cookie 不用處理跨網域（CORS）。
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${backendUrl}/api/:path*` }];
  },
};

module.exports = withNextIntl(nextConfig);
