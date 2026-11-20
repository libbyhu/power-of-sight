package com.powerofsight.entity;

/** 閱讀／觀看狀態。收藏時可以不填（資料庫存 null）。 */
public enum EntryStatus {
    WANT,
    IN_PROGRESS,
    COMPLETED,
    ABANDONED
}
