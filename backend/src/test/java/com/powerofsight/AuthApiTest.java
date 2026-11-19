package com.powerofsight;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AuthApiTest extends ApiTestSupport {

    @Test
    @DisplayName("註冊後拿到 httpOnly cookie，並自動建立一間私人書房")
    void registerCreatesRoomAndCookie() throws Exception {
        mvc.perform(withJson(post("/api/auth/register"),
                        Map.of("email", "Alice@Example.com", "password", "password123", "displayName", "Alice")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(cookie().httpOnly("pos_token", true));

        assertThat(rooms.count()).isEqualTo(1);
        assertThat(users.findByEmail("alice@example.com").orElseThrow().getPasswordHash())
                .as("密碼不能存明碼").startsWith("$2");
    }

    @Test
    @DisplayName("同一個 Email 不能註冊兩次（大小寫視為相同）")
    void duplicateEmailRejected() throws Exception {
        register("alice@example.com", "Alice");
        mvc.perform(withJson(post("/api/auth/register"),
                        Map.of("email", "ALICE@example.com", "password", "password123", "displayName", "A2")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_TAKEN"));
    }

    @Test
    @DisplayName("密碼太短會回傳欄位錯誤")
    void shortPasswordRejected() throws Exception {
        mvc.perform(withJson(post("/api/auth/register"),
                        Map.of("email", "b@example.com", "password", "123", "displayName", "B")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.password").exists());
    }

    @Test
    @DisplayName("密碼錯誤或帳號不存在，都回傳同樣的訊息")
    void wrongCredentials() throws Exception {
        register("alice@example.com", "Alice");
        mvc.perform(withJson(post("/api/auth/login"), Map.of("email", "alice@example.com", "password", "wrong-pass")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
        mvc.perform(withJson(post("/api/auth/login"), Map.of("email", "nobody@example.com", "password", "wrong-pass")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    @DisplayName("沒登入或 token 被竄改，都不能使用書房 API")
    void protectedEndpointsNeedValidToken() throws Exception {
        mvc.perform(get("/api/me/room")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/me/room").cookie(new Cookie("pos_token", "not.a.jwt")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("登入後 /me 回傳自己；登出會清掉 cookie")
    void loginMeLogout() throws Exception {
        register("alice@example.com", "Alice");
        Cookie cookie = mvc.perform(withJson(post("/api/auth/login"),
                        Map.of("email", "alice@example.com", "password", "password123")))
                .andExpect(status().isOk())
                .andReturn().getResponse().getCookie("pos_token");

        mvc.perform(get("/api/auth/me").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Alice"));

        mvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge("pos_token", 0));
    }
}
