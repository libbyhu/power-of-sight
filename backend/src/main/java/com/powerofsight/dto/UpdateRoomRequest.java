package com.powerofsight.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 整份取代：沒有送的選填欄位會被清空。公開設定尚未開放，所以不在這裡。 */
public record UpdateRoomRequest(
        @NotBlank @Size(max = 60) String name,
        @Size(max = 500) String intro,
        @Size(max = 200) String quoteText,
        @Size(max = 100) String quoteSource) {
}
