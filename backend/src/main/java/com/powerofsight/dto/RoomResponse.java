package com.powerofsight.dto;

import com.powerofsight.entity.LayoutStyle;
import com.powerofsight.entity.Room;
import java.time.OffsetDateTime;

public record RoomResponse(
        String name,
        String intro,
        String quoteText,
        String quoteSource,
        LayoutStyle layoutStyle,
        boolean isPublic,
        OffsetDateTime updatedAt) {

    public static RoomResponse from(Room room) {
        return new RoomResponse(room.getName(), room.getIntro(), room.getQuoteText(),
                room.getQuoteSource(), room.getLayoutStyle(), room.isPublic(), room.getUpdatedAt());
    }
}
