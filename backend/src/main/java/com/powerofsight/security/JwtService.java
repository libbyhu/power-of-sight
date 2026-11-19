package com.powerofsight.security;

import com.powerofsight.config.JwtProperties;
import com.powerofsight.entity.User;
import java.time.Instant;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/**
 * 登入成功後簽發 JWT，並包成 httpOnly cookie。
 * httpOnly：前端 JavaScript 讀不到 token，降低被 XSS 偷走的風險。
 * SameSite=Lax：別的網站送來的 POST 不會帶上這個 cookie，用來擋 CSRF。
 */
@Service
public class JwtService {

    public static final String ISSUER = "power-of-sight";

    private final JwtEncoder encoder;
    private final JwtProperties props;

    public JwtService(JwtEncoder encoder, JwtProperties props) {
        this.encoder = encoder;
        this.props = props;
    }

    public ResponseCookie loginCookie(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(user.getId().toString()) // 之後所有 API 都從這裡取得目前登入的會員
                .issuedAt(now)
                .expiresAt(now.plus(props.ttl()))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return baseCookie(token).maxAge(props.ttl()).build();
    }

    public ResponseCookie logoutCookie() {
        return baseCookie("").maxAge(0).build();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        return ResponseCookie.from(props.cookieName(), value)
                .httpOnly(true)
                .secure(props.cookieSecure())
                .sameSite("Lax")
                .path("/");
    }
}
