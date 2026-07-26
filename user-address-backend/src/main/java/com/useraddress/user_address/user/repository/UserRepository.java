package com.useraddress.user_address.user.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.useraddress.user_address.user.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    boolean existsByCurpIgnoreCase(String curp);

    boolean existsByRfcIgnoreCase(String rfc);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByCurpIgnoreCaseAndIdNot(String curp, String id);

    boolean existsByRfcIgnoreCaseAndIdNot(String rfc, String id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, String id);

    @Query("""
            SELECT u FROM User u
            WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.secondLastName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.curp) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.rfc) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    Page<User> search(@Param("search") String search, Pageable pageable);
}
