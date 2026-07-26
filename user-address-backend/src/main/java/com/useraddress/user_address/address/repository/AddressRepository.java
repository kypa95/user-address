package com.useraddress.user_address.address.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.useraddress.user_address.address.entity.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, String> {

    Page<Address> findByUserId(String userId, Pageable pageable);

    @Query("""
            SELECT a FROM Address a
            WHERE a.user.id = :userId AND (
                   LOWER(a.street) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(a.exteriorNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(a.interiorNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(a.neighborhood) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(a.state) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(a.city) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(a.postalCode) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(a.country) LIKE LOWER(CONCAT('%', :search, '%'))
            )
            """)
    Page<Address> searchByUser(@Param("userId") String userId,
            @Param("search") String search, Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Address a WHERE a.user.id = :userId")
    int deleteAllByUserId(@Param("userId") String userId);

    @Query("""
            SELECT a.state AS state, COUNT(DISTINCT a.user.id) AS total
            FROM Address a
            GROUP BY a.state
            ORDER BY COUNT(DISTINCT a.user.id) DESC, a.state ASC
            """)
    List<StateCount> findTopStatesByUserCount(Pageable pageable);

    @Query("SELECT COUNT(DISTINCT a.user.id) FROM Address a")
    long countDistinctUsers();
}
