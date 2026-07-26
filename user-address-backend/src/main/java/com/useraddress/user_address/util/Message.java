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
    public static final String OBJECT_NOT_EXISTS = "%s not exists.";
    public static final String OBJECT_ALREADY_EXISTS = "%s already exists.";
    public static final String OBJECT_WITH_ID_EXISTS = "%s with ID: %s exists.";
    public static final String OBJECT_WITH_ID_NOT_EXISTS = "%s with ID: %s not exists.";
    public static final String OBJECT_WITH_OBJECT_ALREADY_EXISTS = "%s with %s: %s already exists.";
    public static final String OBJECT_MUST_NOT_BE_NULL = "%s must not be null.";

    // LIST MESSAGES //
    public static final String LIST_OBJECT = "List with objects of %s.";
    public static final String LIST_OBJECT_WITH_OBJECT_ID = "List with objects of %s with %s ID: %s.";
    public static final String LIST_PAGEABLE = "List with objects of %s, page: %s, item per page: %s.";

    // USER MESSAGES //
    public static final String USER_ID_CAN_NOT_BE_NULL = "User ID can not be null.";
    public static final String USER_CURP_ALREADY_EXISTS = "The CURP: %s is already registered by another user.";
    public static final String USER_RFC_ALREADY_EXISTS = "The RFC: %s is already registered by another user.";
    public static final String USER_EMAIL_ALREADY_EXISTS = "The email: %s is already registered by another user.";
    public static final String USER_DELETED_WITH_ADDRESSES = "User was deleted successfully with %s address(es) associated.";

    // ADDRESS MESSAGES //
    public static final String ADDRESS_DOES_NOT_BELONG_TO_USER = "The address does not belong to the user with ID: %s.";
    public static final String ADDRESS_USER_ID_CAN_NOT_BE_NULL = "Address must be associated to a user, the user ID can not be null.";

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
