package com.powerofsight.repository;

import com.powerofsight.entity.Entry;
import com.powerofsight.entity.EntryStatus;
import com.powerofsight.entity.MediaType;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

/**
 * 書房列表的篩選條件。每個條件都是選填，組合起來就是：
 * 「我的收藏」+（種類）+（狀態）+（關鍵字）。
 */
public final class EntrySpecifications {

    private EntrySpecifications() {
    }

    public static Specification<Entry> ownedBy(UUID ownerId) {
        return (root, query, cb) -> cb.equal(root.get("ownerId"), ownerId);
    }

    public static Specification<Entry> hasType(MediaType type) {
        return (root, query, cb) -> type == null ? null : cb.equal(root.get("media").get("type"), type);
    }

    public static Specification<Entry> hasStatus(EntryStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    /** 搜尋作品名稱、原文名稱、作者／導演。 */
    public static Specification<Entry> matches(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            String pattern = "%" + escapeLike(keyword.strip().toLowerCase()) + "%";
            var media = root.get("media");
            return cb.or(
                    cb.like(cb.lower(media.get("title")), pattern, '\\'),
                    cb.like(cb.lower(media.get("originalTitle")), pattern, '\\'),
                    cb.like(cb.lower(media.get("creator")), pattern, '\\'));
        };
    }

    /** 讓使用者輸入的 % 和 _ 被當成一般文字，而不是萬用字元。 */
    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
