package com.powerofsight.service;

import static com.powerofsight.repository.EntrySpecifications.hasStatus;
import static com.powerofsight.repository.EntrySpecifications.hasType;
import static com.powerofsight.repository.EntrySpecifications.matches;
import static com.powerofsight.repository.EntrySpecifications.ownedBy;

import com.powerofsight.dto.EntryRequest;
import com.powerofsight.dto.EntryResponse;
import com.powerofsight.dto.PageResponse;
import com.powerofsight.entity.Entry;
import com.powerofsight.entity.EntryStatus;
import com.powerofsight.entity.MediaItem;
import com.powerofsight.entity.MediaType;
import com.powerofsight.exception.ApiException;
import com.powerofsight.repository.EntryRepository;
import com.powerofsight.repository.MediaItemRepository;
import com.powerofsight.repository.RoomRepository;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 書房收藏的商業邏輯。每個方法第一個參數都是 ownerId（目前登入的會員），
 * 所有查詢都會加上「只看自己的」條件。
 */
@Service
public class EntryService {

    private final EntryRepository entries;
    private final MediaItemRepository mediaItems;
    private final RoomRepository rooms;

    public EntryService(EntryRepository entries, MediaItemRepository mediaItems, RoomRepository rooms) {
        this.entries = entries;
        this.mediaItems = mediaItems;
        this.rooms = rooms;
    }

    /** 列表排序：RECENT = 最新放的在前；TITLE = 依種類、再依名稱排列。 */
    public enum ListSort { RECENT, TITLE }

    /** 所有種類混在一起列出；種類、狀態、關鍵字都只是選填的篩選。 */
    @Transactional(readOnly = true)
    public PageResponse<EntryResponse> list(UUID ownerId, MediaType type, EntryStatus status,
                                            String keyword, ListSort sort, int page, int size) {
        var spec = ownedBy(ownerId).and(hasType(type)).and(hasStatus(status)).and(matches(keyword));
        Sort order = sort == ListSort.TITLE
                ? Sort.by("media.type", "media.title", "id")
                : Sort.by(Sort.Direction.DESC, "displayOrder");
        var pageable = PageRequest.of(page, size, order);
        return PageResponse.from(entries.findAll(spec, pageable), EntryResponse::from);
    }

    @Transactional(readOnly = true)
    public EntryResponse get(UUID ownerId, UUID entryId) {
        return EntryResponse.from(findOwn(ownerId, entryId));
    }

    @Transactional
    public EntryResponse create(UUID ownerId, EntryRequest request) {
        // 鎖住書房，確保同時新增的兩筆不會拿到一樣的排序號碼
        rooms.lockByOwnerId(ownerId).orElseThrow(() -> ApiException.notFound("Room"));

        MediaItem media = new MediaItem(request.type(), request.title().strip(), ownerId);
        applyMedia(media, request);
        mediaItems.save(media);

        Entry entry = new Entry(ownerId, media, entries.findMaxDisplayOrder(ownerId) + 1);
        applyNotes(entry, request);
        return EntryResponse.from(entries.saveAndFlush(entry));
    }

    @Transactional
    public EntryResponse update(UUID ownerId, UUID entryId, EntryRequest request) {
        if (request.version() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VERSION_REQUIRED", "version is required when updating");
        }
        Entry entry = findOwn(ownerId, entryId);
        if (entry.getVersion() != request.version()) {
            throw new ApiException(HttpStatus.CONFLICT, "VERSION_CONFLICT",
                    "This entry was changed elsewhere. Reload and try again.");
        }
        MediaItem media = entry.getMedia();
        // 目前作品資料都是自己建立的；之後開放共用作品時，別人建立的作品不能從這裡修改
        if (ownerId.equals(media.getCreatedBy())) {
            applyMedia(media, request);
        }
        applyNotes(entry, request);
        return EntryResponse.from(entries.saveAndFlush(entry));
    }

    @Transactional
    public void delete(UUID ownerId, UUID entryId) {
        Entry entry = findOwn(ownerId, entryId);
        MediaItem media = entry.getMedia();
        entries.delete(entry);
        entries.flush();
        // 沒有人再收藏、而且是自己建立的作品，一起刪掉，不留孤兒資料
        if (ownerId.equals(media.getCreatedBy()) && entries.countByMediaId(media.getId()) == 0) {
            mediaItems.delete(media);
        }
    }

    private Entry findOwn(UUID ownerId, UUID entryId) {
        return entries.findByIdAndOwnerId(entryId, ownerId).orElseThrow(() -> ApiException.notFound("Entry"));
    }

    private static void applyMedia(MediaItem media, EntryRequest r) {
        media.setType(r.type());
        media.setTitle(r.title().strip());
        media.setOriginalTitle(Text.clean(r.originalTitle()));
        media.setCreator(Text.clean(r.creator()));
        media.setReleaseYear(r.releaseYear());
        media.setCoverUrl(Text.clean(r.coverUrl()));
    }

    private static void applyNotes(Entry entry, EntryRequest r) {
        entry.setStatus(r.status());
        entry.setPreference(r.preference());
        entry.setReview(Text.clean(r.review()));
        entry.setCompletedOn(r.completedOn());
    }
}
