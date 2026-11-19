package com.powerofsight.exception;

import org.springframework.http.HttpStatus;

/**
 * 可以預期的錯誤（找不到、重複、沒有權限...）。
 * code 給前端判斷並翻譯成中文或英文；message 是給開發者看的說明。
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static ApiException notFound(String what) {
        return new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", what + " not found");
    }

    public HttpStatus getStatus() { return status; }
    public String getCode() { return code; }
}
