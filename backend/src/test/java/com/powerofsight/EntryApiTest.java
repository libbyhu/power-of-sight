package com.powerofsight;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.Cookie;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class EntryApiTest extends ApiTestSupport {

    @Test
    @DisplayName("只填種類和名稱就能收藏；不同種類混在同一個列表，新的在前面")
    void mixedRoomNewestFirst() throws Exception {
        Cookie alice = register("alice@example.com", "Alice");
        addEntry(alice, Map.of("type", "BOOK", "title", "挪威的森林"));
        addEntry(alice, Map.of("type", "MOVIE", "title", "神隱少女"));
        addEntry(alice, Map.of("type", "ANIME", "title", "葬送的芙莉蓮"));

        mvc.perform(getAs(alice, "/api/me/entries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(3))
                .andExpect(jsonPath("$.items[0].title").value("葬送的芙莉蓮"))
                .andExpect(jsonPath("$.items[0].status").doesNotExist());
    }

    @Test
    @DisplayName("可以用種類、狀態、關鍵字篩選")
    void filters() throws Exception {
        Cookie alice = register("alice@example.com", "Alice");
        addEntry(alice, Map.of("type", "BOOK", "title", "挪威的森林", "creator", "村上春樹", "status", "COMPLETED"));
        addEntry(alice, Map.of("type", "BOOK", "title", "百年孤寂", "status", "WANT"));
        addEntry(alice, Map.of("type", "MOVIE", "title", "神隱少女", "creator", "宮崎駿", "status", "WANT"));

        mvc.perform(getAs(alice, "/api/me/entries?type=BOOK"))
                .andExpect(jsonPath("$.totalItems").value(2));
        mvc.perform(getAs(alice, "/api/me/entries?status=WANT"))
                .andExpect(jsonPath("$.totalItems").value(2));
        mvc.perform(getAs(alice, "/api/me/entries?type=BOOK&status=WANT"))
                .andExpect(jsonPath("$.totalItems").value(1));
        mvc.perform(getAs(alice, "/api/me/entries?q=村上"))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].title").value("挪威的森林"));
        // % 是一般文字，不是「全部符合」
        mvc.perform(getAs(alice, "/api/me/entries?q=%25"))
                .andExpect(jsonPath("$.totalItems").value(0));
    }

    @Test
    @DisplayName("欄位驗證：不明種類、心得超過 300 字、偷塞 ownerId 都會被拒絕")
    void validation() throws Exception {
        Cookie alice = register("alice@example.com", "Alice");
        mvc.perform(withJson(post("/api/me/entries"), Map.of("type", "GAME", "title", "x"))
                        .cookie(alice))
                .andExpect(status().isBadRequest());
        mvc.perform(withJson(post("/api/me/entries"), Map.of("type", "BOOK", "title", "x", "review", "字".repeat(301)))
                        .cookie(alice))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.review").exists());
        mvc.perform(withJson(post("/api/me/entries"), Map.of("type", "BOOK", "title", "x", "preference", 6))
                        .cookie(alice))
                .andExpect(status().isBadRequest());
        mvc.perform(withJson(
                                post("/api/me/entries"),
                                Map.of("type", "BOOK", "title", "x", "ownerId", "00000000-0000-0000-0000-000000000000"))
                        .cookie(alice))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("會員之間互相看不到、改不了、刪不掉對方的收藏")
    void ownersAreIsolated() throws Exception {
        Cookie alice = register("alice@example.com", "Alice");
        Cookie bob = register("bob@example.com", "Bob");
        String id = addEntry(alice, Map.of("type", "BOOK", "title", "挪威的森林"))
                .get("id")
                .asText();

        mvc.perform(getAs(bob, "/api/me/entries"))
                .andExpect(jsonPath("$.totalItems").value(0));
        mvc.perform(getAs(bob, "/api/me/entries/" + id)).andExpect(status().isNotFound());
        mvc.perform(withJson(
                        putAs(bob, "/api/me/entries/" + id), Map.of("type", "BOOK", "title", "hacked", "version", 0)))
                .andExpect(status().isNotFound());
        mvc.perform(deleteAs(bob, "/api/me/entries/" + id)).andExpect(status().isNotFound());

        mvc.perform(getAs(alice, "/api/me/entries/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("挪威的森林"));
    }

    @Test
    @DisplayName("修改要帶 version；用舊畫面的 version 送出會收到 409")
    void optimisticLocking() throws Exception {
        Cookie alice = register("alice@example.com", "Alice");
        JsonNode created = addEntry(alice, Map.of("type", "BOOK", "title", "挪威的森林"));
        String url = "/api/me/entries/" + created.get("id").asText();

        Map<String, Object> body = new HashMap<>(
                Map.of("type", "BOOK", "title", "挪威的森林", "status", "COMPLETED", "preference", 5, "review", "很安靜"));
        mvc.perform(withJson(putAs(alice, url), body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VERSION_REQUIRED"));

        body.put("version", 0);
        mvc.perform(withJson(putAs(alice, url), body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.preference").value(5));

        body.put("review", "舊分頁的內容");
        mvc.perform(withJson(putAs(alice, url), body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("VERSION_CONFLICT"));
    }

    @Test
    @DisplayName("刪除收藏時，沒人再用的作品資料也一起刪掉")
    void deleteRemovesOrphanMedia() throws Exception {
        Cookie alice = register("alice@example.com", "Alice");
        String id = addEntry(alice, Map.of("type", "MOVIE", "title", "神隱少女"))
                .get("id")
                .asText();
        assertThat(mediaItems.count()).isEqualTo(1);

        mvc.perform(deleteAs(alice, "/api/me/entries/" + id)).andExpect(status().isNoContent());
        mvc.perform(getAs(alice, "/api/me/entries/" + id)).andExpect(status().isNotFound());
        assertThat(mediaItems.count()).isZero();
    }

    @Test
    @DisplayName("分頁大小有上限，避免一次撈太多")
    void pageSizeLimit() throws Exception {
        Cookie alice = register("alice@example.com", "Alice");
        mvc.perform(getAs(alice, "/api/me/entries?size=500")).andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("sort=TITLE：依種類、再依名稱排列；預設最新的在前")
    void sortByTitle() throws Exception {
        Cookie alice = register("alice@example.com", "Alice");
        addEntry(alice, Map.of("type", "MOVIE", "title", "C 電影"));
        addEntry(alice, Map.of("type", "BOOK", "title", "B 書"));
        addEntry(alice, Map.of("type", "BOOK", "title", "A 書"));

        mvc.perform(getAs(alice, "/api/me/entries?sort=TITLE"))
                .andExpect(jsonPath("$.items[0].title").value("A 書"))
                .andExpect(jsonPath("$.items[1].title").value("B 書"))
                .andExpect(jsonPath("$.items[2].title").value("C 電影"));
        // 預設：最新放的在前
        mvc.perform(getAs(alice, "/api/me/entries"))
                .andExpect(jsonPath("$.items[0].title").value("A 書"))
                .andExpect(jsonPath("$.items[2].title").value("C 電影"));
        mvc.perform(getAs(alice, "/api/me/entries?sort=WHATEVER")).andExpect(status().isBadRequest());
    }
}
