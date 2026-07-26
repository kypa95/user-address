package com.useraddress.user_address.user.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.useraddress.user_address.user.dto.UserFilter;
import com.useraddress.user_address.user.entity.User;

import jakarta.persistence.criteria.Predicate;

/**
 * Builds the WHERE clause of the user listing from a {@link UserFilter}.
 *
 * <p>Only the fields that carry a value become predicates, so an unused filter
 * never reaches the database. That also avoids the untyped-null parameter that
 * makes Postgres reject {@code LOWER(:param)} in a static query.
 */
public final class UserSpecifications {

    /** Columns the global search box looks into. */
    private static final String[] SEARCHABLE = {
            "name", "lastName", "secondLastName", "curp", "rfc", "email", "phoneNumber"
    };

    private UserSpecifications() {
    }

    /**
     * @param filter criteria to apply; an empty one matches every user
     * @return a specification combining every requested criterion with AND
     */
    public static Specification<User> matching(UserFilter filter) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hasText(filter.search())) {
                // The global box matches when ANY column contains the term.
                List<Predicate> anyColumn = new ArrayList<>();
                for (String column : SEARCHABLE) {
                    anyColumn.add(contains(builder, root, column, filter.search()));
                }
                predicates.add(builder.or(anyColumn.toArray(Predicate[]::new)));
            }

            addContains(predicates, builder, root, "name", filter.name());
            addContains(predicates, builder, root, "lastName", filter.lastName());
            addContains(predicates, builder, root, "secondLastName", filter.secondLastName());
            addContains(predicates, builder, root, "curp", filter.curp());
            addContains(predicates, builder, root, "rfc", filter.rfc());
            addContains(predicates, builder, root, "email", filter.email());
            addContains(predicates, builder, root, "phoneNumber", filter.phoneNumber());

            return predicates.isEmpty()
                    ? builder.conjunction()
                    : builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static void addContains(
            List<Predicate> predicates,
            jakarta.persistence.criteria.CriteriaBuilder builder,
            jakarta.persistence.criteria.Root<User> root,
            String column,
            String value) {

        if (!hasText(value)) {
            return;
        }
        predicates.add(contains(builder, root, column, value));
    }

    /**
     * Case insensitive "contains". Accents are significant: "perez" does not
     * match a stored "Pérez".
     */
    private static Predicate contains(
            jakarta.persistence.criteria.CriteriaBuilder builder,
            jakarta.persistence.criteria.Root<User> root,
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
