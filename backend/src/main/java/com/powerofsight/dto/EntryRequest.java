package com.powerofsight.dto;

import com.powerofsight.entity.EntryStatus;
import com.powerofsight.entity.MediaType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * 新增或修改一筆收藏。只有「種類」和「名稱」必填，其餘都可以留白。
 * 修改（PUT）時必須帶上次讀到的 version。
 */
public record EntryRequest(
        @NotNull MediaType type,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 200) String originalTitle,
        @Size(max = 120) String creator,
        @Min(1000) @Max(3000) Integer releaseYear,
        @Size(max = 500) @Pattern(regexp = "^https?://.*", message = "must start with http:// or https://")
                String coverUrl,
        EntryStatus status,
        @Min(1) @Max(5) Integer preference,
        @Size(max = 300) String review,
        @PastOrPresent LocalDate completedOn,
        @PositiveOrZero Long version) {}
