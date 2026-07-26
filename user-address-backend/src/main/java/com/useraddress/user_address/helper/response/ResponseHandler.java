package com.useraddress.user_address.helper.response;

import java.sql.Timestamp;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Packages every response with the same envelope so the clients always read the
 * same fields: timestamp, message, success, status, code and data.
 **/
public class ResponseHandler {

    private ResponseHandler() {
    }

    public static <T> ResponseEntity<ResponseWrapper<T>> wrapSuccessResponse(String message, HttpStatus status,
            T responseObj) {
        ResponseWrapper<T> body = new ResponseWrapper<>(
                new Timestamp(System.currentTimeMillis()),
                message,
                Boolean.TRUE,
                status,
                status.value(),
                responseObj,
                null);

        return new ResponseEntity<>(body, status);
    }

    public static <T> ResponseEntity<ResponseWrapper<T>> wrapFailureResponse(String message, HttpStatus status,
            int statusValue, T responseObj, String url) {
        ResponseWrapper<T> body = new ResponseWrapper<>(
                new Timestamp(System.currentTimeMillis()),
                message,
                Boolean.FALSE,
                status,
                statusValue,
                responseObj,
                url);

        return new ResponseEntity<>(body, status);
    }
}
