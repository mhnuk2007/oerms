package com.oerms.userservice.repository;

import com.oerms.userservice.entity.Role;
import com.oerms.userservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndIsDeletedFalse(UUID id);

    boolean existsByEmail(String email);

    Page<User> findByIsDeletedFalse(Pageable pageable);

    Page<User> findByRolesContainingAndIsDeletedFalse(Role role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
            "u.isDeleted = false AND " +
            "(:search IS NULL OR " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:role IS NULL OR :role MEMBER OF u.roles)")
    Page<User> searchUsers(@Param("search") String search,
                           @Param("role") Role role,
                           Pageable pageable);

    long countByIsDeletedFalseAndRolesContaining(Role role);
}
