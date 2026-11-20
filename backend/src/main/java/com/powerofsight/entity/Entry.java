package com.powerofsight.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/** 書房裡的一筆收藏：某位會員 × 某部作品，加上他自己的紀錄。 */
@Entity
@Table(name = "entries")
public class Entry {

    @Id
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "media_item_id", nullable = false)
    private MediaItem media;

    @Enumerated(EnumType.STRING)
    @Column(length = 12)
    private EntryStatus status;

    private Integer preference;

    @Column(length = 300)
    private String review;

    @Column(name = "completed_on")
    private LocalDate completedOn;

    @Column(name = "display_order", nullable = false)
    private long displayOrder;

    /** 每次更新 +1。前端送來的 version 不一致就代表資料已被別的畫面改過。 */
    @Version
    private long version;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected Entry() {}

    public Entry(UUID ownerId, MediaItem media, long displayOrder) {
        this.id = UUID.randomUUID();
        this.ownerId = ownerId;
        this.media = media;
        this.displayOrder = displayOrder;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void touch() {
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public MediaItem getMedia() {
        return media;
    }

    public EntryStatus getStatus() {
        return status;
    }

    public Integer getPreference() {
        return preference;
    }

    public String getReview() {
        return review;
    }

    public LocalDate getCompletedOn() {
        return completedOn;
    }

    public long getDisplayOrder() {
        return displayOrder;
    }

    public long getVersion() {
        return version;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setStatus(EntryStatus status) {
        this.status = status;
    }

    public void setPreference(Integer preference) {
        this.preference = preference;
    }

    public void setReview(String review) {
        this.review = review;
    }

    public void setCompletedOn(LocalDate completedOn) {
        this.completedOn = completedOn;
    }
}
