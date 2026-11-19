package com.powerofsight.dto;

import java.util.Map;

/** 書房統計：總數、各種類幾部、各狀態幾部（沒填狀態的算在 "NONE"）。 */
public record RoomStatsResponse(long total, Map<String, Long> byType, Map<String, Long> byStatus) {
}
