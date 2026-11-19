package com.powerofsight.service;

import com.powerofsight.dto.RoomResponse;
import com.powerofsight.dto.RoomStatsResponse;
import com.powerofsight.dto.UpdateLayoutRequest;
import com.powerofsight.dto.UpdateRoomRequest;
import com.powerofsight.entity.Room;
import com.powerofsight.exception.ApiException;
import com.powerofsight.repository.EntryRepository;
import com.powerofsight.repository.RoomRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoomService {

    private final RoomRepository rooms;
    private final EntryRepository entries;

    public RoomService(RoomRepository rooms, EntryRepository entries) {
        this.rooms = rooms;
        this.entries = entries;
    }

    @Transactional(readOnly = true)
    public RoomResponse get(UUID ownerId) {
        return RoomResponse.from(find(ownerId));
    }

    @Transactional
    public RoomResponse update(UUID ownerId, UpdateRoomRequest request) {
        Room room = find(ownerId);
        room.setName(request.name().strip());
        room.setIntro(Text.clean(request.intro()));
        room.setQuoteText(Text.clean(request.quoteText()));
        room.setQuoteSource(Text.clean(request.quoteSource()));
        return RoomResponse.from(rooms.saveAndFlush(room));
    }

    /** 走進另一扇門：只換擺放風格，收藏完全不動。 */
    @Transactional
    public RoomResponse updateLayout(UUID ownerId, UpdateLayoutRequest request) {
        Room room = find(ownerId);
        room.setLayoutStyle(request.layoutStyle());
        return RoomResponse.from(rooms.saveAndFlush(room));
    }

    @Transactional(readOnly = true)
    public RoomStatsResponse stats(UUID ownerId) {
        Map<String, Long> byType = new LinkedHashMap<>();
        long total = 0;
        for (Object[] row : entries.countByType(ownerId)) {
            long count = (Long) row[1];
            byType.put(row[0].toString(), count);
            total += count;
        }
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (Object[] row : entries.countByStatus(ownerId)) {
            byStatus.put(row[0] == null ? "NONE" : row[0].toString(), (Long) row[1]);
        }
        return new RoomStatsResponse(total, byType, byStatus);
    }

    private Room find(UUID ownerId) {
        return rooms.findByOwnerId(ownerId).orElseThrow(() -> ApiException.notFound("Room"));
    }
}
