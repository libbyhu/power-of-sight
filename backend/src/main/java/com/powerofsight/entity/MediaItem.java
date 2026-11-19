package com.powerofsight.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

/** 作品本身的資料。會員自己的心得、喜好放在 {@link Entry}。 */
@Entity
@Table(name = "media_items")
public class MediaItem {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private MediaType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "original_title", length = 200)
    private String originalTitle;

    @Column(length = 120)
    private String creator;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected MediaItem() {
    }

    public MediaItem(MediaType type, String title, UUID createdBy) {
        this.id = UUID.randomUUID();
        this.type = type;
        this.title = title;
        this.createdBy = createdBy;
        this.createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public MediaType getType() { return type; }
    public String getTitle() { return title; }
    public String getOriginalTitle() { return originalTitle; }
    public String getCreator() { return creator; }
    public Integer getReleaseYear() { return releaseYear; }
    public String getCoverUrl() { return coverUrl; }
    public UUID getCreatedBy() { return createdBy; }

    public void setType(MediaType type) { this.type = type; }
    public void setTitle(String title) { this.title = title; }
    public void setOriginalTitle(String originalTitle) { this.originalTitle = originalTitle; }
    public void setCreator(String creator) { this.creator = creator; }
    public void setReleaseYear(Integer releaseYear) { this.releaseYear = releaseYear; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
}
