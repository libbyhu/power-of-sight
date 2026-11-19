package com.powerofsight;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class RoomApiTest extends ApiTestSupport {

    @Test
    @DisplayName("書房預設私人，可以改名稱、介紹和引言")
    void updateRoom() throws Exception {
        Cookie alice = register("alice@example.com", "Alice");

        mvc.perform(getAs(alice, "/api/me/room"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alice的書房"))
                .andExpect(jsonPath("$.isPublic").value(false));

        mvc.perform(withJson(putAs(alice, "/api/me/room"),
                        Map.of("name", "月光書房", "intro", "書和電影放在一起", "quoteText", "進入眼中的一切")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("月光書房"))
                .andExpect(jsonPath("$.intro").value("書和電影放在一起"));
    }

    @Test
    @DisplayName("書房名稱不能是空白")
    void blankNameRejected() throws Exception {
        Cookie alice = register("alice@example.com", "Alice");
        mvc.perform(withJson(putAs(alice, "/api/me/room"), Map.of("name", "   ")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("統計會分開計算種類和狀態，沒填狀態算 NONE")
    void stats() throws Exception {
        Cookie alice = register("alice@example.com", "Alice");
        addEntry(alice, Map.of("type", "BOOK", "title", "挪威的森林", "status", "COMPLETED"));
        addEntry(alice, Map.of("type", "BOOK", "title", "海邊的卡夫卡"));
        addEntry(alice, Map.of("type", "MOVIE", "title", "神隱少女", "status", "WANT"));

        mvc.perform(getAs(alice, "/api/me/room/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.byType.BOOK").value(2))
                .andExpect(jsonPath("$.byType.MOVIE").value(1))
                .andExpect(jsonPath("$.byStatus.NONE").value(1))
                .andExpect(jsonPath("$.byStatus.WANT").value(1));
    }
}
