package com.useraddress.user_address.user.dto;

/**
 * Criteria the user listing can be narrowed by.
 *
 * <p>{@code search} is the global box: it matches any of the visible columns.
 * The rest are the per-column filters, and every one of them is a
 * case-insensitive "contains". A null or blank field is simply not applied.
 *
 * <p>Field names match the ones the frontend sends, so the query string reads
 * the same as the columns on screen.
 */
public record UserFilter(
        String search,
        String name,
        String lastName,
        String secondLastName,
        String curp,
        String rfc,
        String email,
        String phoneNumber) {

    /** True when nothing was requested, so the listing returns every user. */
    public boolean isEmpty() {
        return isBlank(search)
                && isBlank(name)
                && isBlank(lastName)
                && isBlank(secondLastName)
                && isBlank(curp)
                && isBlank(rfc)
                && isBlank(email)
                && isBlank(phoneNumber);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
