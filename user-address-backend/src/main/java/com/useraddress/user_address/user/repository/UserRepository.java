package com.useraddress.user_address.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.useraddress.user_address.user.entity.User;

/**
 * The listing query is not declared here: it is assembled at runtime by
 * {@link UserSpecifications}, since which criteria apply depends on what the
 * caller filled in.
 */
@Repository
public interface UserRepository extends JpaRepository<User, String>, JpaSpecificationExecutor<User> {

    boolean existsByCurpIgnoreCase(String curp);

    boolean existsByRfcIgnoreCase(String rfc);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByCurpIgnoreCaseAndIdNot(String curp, String id);

    boolean existsByRfcIgnoreCaseAndIdNot(String rfc, String id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, String id);
}
