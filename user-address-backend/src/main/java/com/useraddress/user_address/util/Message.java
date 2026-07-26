package com.useraddress.user_address.util;

import org.springframework.data.domain.Pageable;

/**
 * Message templates used by controllers and services. Templates with {@code %s}
 * are meant to be filled through {@link #formatMessage(String, Object...)}.
 **/
public class Message {

    private Message() {
    }

    // GENERIC OBJECT MESSAGES //
    public static final String OBJECT_CREATED = "%s was created successfully.";
    public static final String OBJECT_UPDATED = "%s was updated successfully.";
    public static final String OBJECT_DELETED = "%s was deleted successfully.";
    public static final String OBJECT_WITH_ID_EXISTS = "%s with ID: %s exists.";
    public static final String OBJECT_WITH_ID_NOT_EXISTS = "%s with ID: %s not exists.";

    // LIST MESSAGES //
    public static final String LIST_OBJECT_WITH_OBJECT_ID = "List with objects of %s with %s ID: %s.";
   public static final String LIST_PAGEABLE = "List with objects of %s, page: %s, item per page: %s.";

    // USER MESSAGES //
    public static final String USER_CURP_ALREADY_EXISTS = "The CURP: %s is already registered by another user.";
    public static final String USER_RFC_ALREADY_EXISTS = "The RFC: %s is already registered by another user.";
    public static final String USER_EMAIL_ALREADY_EXISTS = "The email: %s is already registered by another user.";

    // DASHBOARD MESSAGES //
    public static final String DASHBOARD_SUMMARY = "Dashboard summary.";

    // EXPORT MESSAGES //
    public static final String REPORT_GENERATION_FAILED = "The %s report could not be generated.";
    public static final String EXPORT_FILE_NAME = "usuarios_%s.xlsx";
    /** CURP identifies the owner, so exports of different users never collide. */
    public static final String EXPORT_ADDRESSES_FILE_NAME = "direcciones_%s_%s.xlsx";

    // SYSTEM MESSAGES //
    public static final String METHOD_NOT_ALLOWED = "The method: %s is not allowed for this endpoint.";
    public static final String DUPLICATE_KEY_IN_DB = "The record violates a unique constraint in the database.";
    public static final String UNKNOWN_ERROR = "An unexpected error occurred, please contact the administrator.";

    public static String formatMessage(String format, Object... values) {
        return String.format(format, values);
    }

    public static String formatMessage(Pageable pageable, String model) {
        return String.format(LIST_PAGEABLE, model, pageable.getPageNumber(), pageable.getPageSize());
    }
}
