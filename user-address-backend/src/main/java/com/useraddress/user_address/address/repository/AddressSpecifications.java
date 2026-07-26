package com.useraddress.user_address.address.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.useraddress.user_address.address.dto.AddressFilter;
import com.useraddress.user_address.address.entity.Address;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

/**
 * Builds the WHERE clause of the address listing from an {@link AddressFilter}.
 *
 * <p>Only the fields that carry a value become predicates, so an unused filter
 * never reaches the database. That also avoids the untyped-null parameter that
 * makes Postgres reject {@code LOWER(:param)} in a static query.
 */
public final class AddressSpecifications {

    /** Columns the global search box looks into. */
    private static final String[] SEARCHABLE = {
            "street", "exteriorNumber", "interiorNumber", "neighborhood",
            "state", "city", "postalCode", "country"
    };

    private AddressSpecifications() {
    }

    /**
     * @param userId owner the addresses must belong to
     * @param filter criteria to apply; an empty one matches every address of the user
     * @return a specification combining the owner and every requested criterion with AND
     */
    public static Specification<Address> matching(String userId, AddressFilter filter) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // The owner is never optional: this listing is always scoped to a user.
            predicates.add(builder.equal(root.get("user").get("id"), userId));

            if (hasText(filter.search())) {
                // The global box matches when ANY column contains the term.
                List<Predicate> anyColumn = new ArrayList<>();
                for (String column : SEARCHABLE) {
                    anyColumn.add(contains(builder, root, column, filter.search()));
                }
                predicates.add(builder.or(anyColumn.toArray(Predicate[]::new)));
            }

            addContains(predicates, builder, root, "street", filter.street());
            addContains(predicates, builder, root, "exteriorNumber", filter.exteriorNumber());
            addContains(predicates, builder, root, "interiorNumber", filter.interiorNumber());
            addContains(predicates, builder, root, "neighborhood", filter.neighborhood());
            addContains(predicates, builder, root, "state", filter.state());
            addContains(predicates, builder, root, "city", filter.city());
            addContains(predicates, builder, root, "postalCode", filter.postalCode());
            addContains(predicates, builder, root, "country", filter.country());

            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static void addContains(
            List<Predicate> predicates,
            CriteriaBuilder builder,
            Root<Address> root,
            String column,
            String value) {

        if (!hasText(value)) {
            return;
        }
        predicates.add(contains(builder, root, column, value));
    }

    /**
     * Case insensitive "contains". Accents are significant: "mexico" does not
     * match a stored "México".
     */
    private static Predicate contains(
            CriteriaBuilder builder,
            Root<Address> root,
            String column,
            String value) {

        return builder.like(builder.lower(root.get(column)), like(value));
    }

    private static String like(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
