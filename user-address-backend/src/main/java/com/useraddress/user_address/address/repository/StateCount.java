package com.useraddress.user_address.address.repository;

/**
 * Projection returned by the "users per state" aggregation.
 *
 * <p>Spring Data maps the query aliases onto these getters, so no entity is
 * loaded for a report that only needs two columns.
 */
public interface StateCount {

    String getState();

    long getTotal();
}
