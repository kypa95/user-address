package com.useraddress.user_address.address.dto;

/**
 * Criteria the address listing of a user can be narrowed by.
 *
 * <p>{@code search} is the global box: it matches any of the visible columns.
 * The rest are the per-column filters, every one a case-insensitive "contains".
 * A null or blank field is simply not applied.
 *
 * <p>Field names match the ones the frontend sends, so the query string reads
 * the same as the columns on screen.
 */
public record AddressFilter(
        String search,
        String street,
        String exteriorNumber,
        String interiorNumber,
        String neighborhood,
        String state,
        String city,
        String postalCode,
        String country) {

    /** True when nothing was requested, so the listing returns every address. */
    public boolean isEmpty() {
        return isBlank(search)
                && isBlank(street)
                && isBlank(exteriorNumber)
                && isBlank(interiorNumber)
                && isBlank(neighborhood)
                && isBlank(state)
                && isBlank(city)
                && isBlank(postalCode)
                && isBlank(country);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
