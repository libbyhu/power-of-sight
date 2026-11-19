package com.powerofsight;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.powerofsight.repository.EntryRepository;
import com.powerofsight.repository.MediaItemRepository;
import com.powerofsight.repository.RoomRepository;
import com.powerofsight.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** 整合測試共用：啟動整個 Spring Boot、用 MockMvc 送真的 HTTP 請求。 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
abstract class ApiTestSupport {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository users;
    @Autowired RoomRepository rooms;
    @Autowired EntryRepository entries;
    @Autowired MediaItemRepository mediaItems;

    @BeforeEach
    void cleanDatabase() {
        entries.deleteAll();
        mediaItems.deleteAll();
        rooms.deleteAll();
        users.deleteAll();
    }

    /** 註冊一位會員，回傳登入 cookie。 */
    Cookie register(String email, String displayName) throws Exception {
        MvcResult result = mvc.perform(withJson(post("/api/auth/register"),
                        Map.of("email", email, "password", "password123", "displayName", displayName)))
                .andReturn();
        if (result.getResponse().getStatus() != 201) {
            throw new IllegalStateException("register failed: " + result.getResponse().getContentAsString());
        }
        return result.getResponse().getCookie("pos_token");
    }

    JsonNode addEntry(Cookie cookie, Map<String, ?> body) throws Exception {
        MvcResult result = mvc.perform(withJson(post("/api/me/entries"), body).cookie(cookie)).andReturn();
        if (result.getResponse().getStatus() != 201) {
            throw new IllegalStateException("add failed: " + result.getResponse().getContentAsString());
        }
        return json.readTree(result.getResponse().getContentAsString());
    }

    MockHttpServletRequestBuilder withJson(MockHttpServletRequestBuilder builder, Object body) throws Exception {
        return builder.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
    }

    MockHttpServletRequestBuilder getAs(Cookie cookie, String url) {
        return get(url).cookie(cookie);
    }

    MockHttpServletRequestBuilder putAs(Cookie cookie, String url) {
        return put(url).cookie(cookie);
    }

    MockHttpServletRequestBuilder deleteAs(Cookie cookie, String url) {
        return delete(url).cookie(cookie);
    }
}
