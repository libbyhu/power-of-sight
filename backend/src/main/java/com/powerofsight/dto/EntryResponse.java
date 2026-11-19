package com.powerofsight.dto;

import com.powerofsight.entity.Entry;
import com.powerofsight.entity.EntryStatus;
import com.powerofsight.entity.MediaType;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record EntryResponse(
        UUID id,
        MediaType type,
        String title,
        String originalTitle,
        String creator,
        Integer releaseYear,
        String coverUrl,
        EntryStatus status,
        Integer preference,
        String review,
        LocalDate completedOn,
        long version,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {

    public static EntryResponse from(Entry e) {
        var m = e.getMedia();
        return new EntryResponse(
                e.getId(),
                m.getType(),
                m.getTitle(),
                m.getOriginalTitle(),
                m.getCreator(),
                m.getReleaseYear(),
                m.getCoverUrl(),
                e.getStatus(),
                e.getPreference(),
                e.getReview(),
                e.getCompletedOn(),
                e.getVersion(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }
}
