package com.powerofsight.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** 對應 application.properties 裡 app.jwt.* 的設定。 */
@Validated
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        @NotBlank String secret, @NotNull Duration ttl, @NotBlank String cookieName, boolean cookieSecure) {

    public JwtProperties {
        // HS256 至少需要 256 bits（32 bytes）的金鑰
        if (secret != null && secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("app.jwt.secret must be at least 32 bytes");
        }
    }
}
