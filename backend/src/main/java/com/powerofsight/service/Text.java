package com.powerofsight.service;

/** 小工具：去掉前後空白，空字串一律存成 null。 */
final class Text {

    private Text() {
    }

    static String clean(String value) {
        if (value == null) {
            return null;
        }
        String stripped = value.strip();
        return stripped.isEmpty() ? null : stripped;
    }
}
