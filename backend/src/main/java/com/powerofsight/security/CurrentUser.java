package com.powerofsight.security;

import java.util.UUID;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * 從已驗證的 JWT 取出會員 id。
 * 會員 id 只能從這裡來，絕不接受前端在請求內容裡自己填。
 */
public final class CurrentUser {

    private CurrentUser() {}

    public static UUID id(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
