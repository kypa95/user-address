package com.useraddress.user_address.helper.response;

import java.sql.Timestamp;

import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.annotation.JsonInclude;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Envelope returned by every endpoint. Being generic lets OpenAPI resolve the real
 * type of {@code data} instead of showing an untyped map.
 *
 * @param <T> payload carried by the response
 **/
@Schema(description = "Envelope shared by every response of the API.")
public record ResponseWrapper<T>(

        @Schema(description = "Moment the response was built.")
        Timestamp timestamp,

        @Schema(description = "Human readable description of the result.",
                example = "user was created successfully.")
        String message,

        @Schema(description = "True when the operation finished without errors.", example = "true")
        Boolean success,

        @Schema(description = "HTTP status of the response.", example = "OK")
        HttpStatus status,

        @Schema(description = "HTTP status value on success, business error code from ErrorCode on failure.",
                example = "200")
        int code,

        @Schema(description = "Payload of the response, null when the operation returns nothing.")
        T data,

        @JsonInclude(JsonInclude.Include.NON_NULL)
        @Schema(description = "URI that produced the error. Only present on failures.",
                example = "/api/users")
        String url) {
}
