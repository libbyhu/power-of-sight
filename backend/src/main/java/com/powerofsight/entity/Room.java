package com.powerofsight.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

/** 個人書房。每位會員註冊時自動建立一間。 */
@Entity
@Table(name = "rooms")
public class Room {

    @Id
    private UUID id;

    @Column(name = "owner_id", nullable = false, unique = true)
    private UUID ownerId;

    @Column(nullable = false, length = 60)
    private String name;

    @Column(length = 500)
    private String intro;

    @Column(name = "quote_text", length = 200)
    private String quoteText;

    @Column(name = "quote_source", length = 100)
    private String quoteSource;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected Room() {
    }

    public Room(UUID ownerId, String name) {
        this.id = UUID.randomUUID();
        this.ownerId = ownerId;
        this.name = name;
        this.isPublic = false; // 預設私人
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void touch() {
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getOwnerId() { return ownerId; }
    public String getName() { return name; }
    public String getIntro() { return intro; }
    public String getQuoteText() { return quoteText; }
    public String getQuoteSource() { return quoteSource; }
    public boolean isPublic() { return isPublic; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public void setName(String name) { this.name = name; }
    public void setIntro(String intro) { this.intro = intro; }
    public void setQuoteText(String quoteText) { this.quoteText = quoteText; }
    public void setQuoteSource(String quoteSource) { this.quoteSource = quoteSource; }
}
