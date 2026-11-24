package com.powerofsight.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Set;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;

/**
 * 從 cookie 取出 JWT。也接受 Authorization: Bearer 標頭，方便用 curl / Postman 測試。
 *
 * <p>公開端點（註冊、登入、登出、健康檢查）不讀取 token：
 * 瀏覽器可能還帶著過期或以舊金鑰簽發的 cookie，若照常驗證會回 401，使用者將無法重新登入或登出。
 */
public class CookieBearerTokenResolver implements BearerTokenResolver {

    private static final Set<String> PUBLIC_PATHS =
            Set.of("/api/auth/register", "/api/auth/login", "/api/auth/logout", "/api/health");

    private final String cookieName;
    private final DefaultBearerTokenResolver headerResolver = new DefaultBearerTokenResolver();

    public CookieBearerTokenResolver(String cookieName) {
        this.cookieName = cookieName;
    }

    @Override
    public String resolve(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if (PUBLIC_PATHS.contains(path)) {
            return null;
        }
        String fromHeader = headerResolver.resolve(request);
        if (fromHeader != null) {
            return fromHeader;
        }
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName()) && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
