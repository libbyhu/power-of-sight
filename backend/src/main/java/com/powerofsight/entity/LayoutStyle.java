package com.powerofsight.entity;

/**
 * 書房的兩扇門。只改變作品「怎麼擺出來」，不改變資料本身，
 * 所以可以隨時切換。
 */
public enum LayoutStyle {
    /** 整齊書架：依種類分層、依名稱排序 */
    TIDY,
    /** 散落書房：亂中有序，之後支援自由擺放 */
    ARTISTIC
}
