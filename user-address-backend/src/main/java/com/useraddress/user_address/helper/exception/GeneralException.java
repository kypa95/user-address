package com.useraddress.user_address.helper.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

/**
 * Every exception thrown by us. Carries the HTTP status to answer with and the
 * business error code taken from {@code ErrorCode}.
 **/
@Getter
public class GeneralException extends RuntimeException {

    private final HttpStatus method;
    private final int code;
    private final String data;

    public GeneralException(String message) {
        super(message);
        this.method = HttpStatus.BAD_REQUEST;
        this.code = this.method.value();
        this.data = null;
    }

    public GeneralException(String message, HttpStatus method) {
        super(message);
        this.method = method;
        this.code = this.method.value();
        this.data = null;
    }

    public GeneralException(String message, int code) {
        super(message);
        this.method = HttpStatus.BAD_REQUEST;
        this.code = code;
        this.data = null;
    }

    public GeneralException(String message, int code, HttpStatus method) {
        super(message);
        this.method = method;
        this.code = code;
        this.data = null;
    }

    public GeneralException(String message, int code, String data) {
        super(message);
        this.method = HttpStatus.BAD_REQUEST;
        this.code = code;
        this.data = data;
    }

    public GeneralException(String message, int code, HttpStatus method, String data) {
        super(message);
        this.method = method;
        this.code = code;
        this.data = data;
    }
}
