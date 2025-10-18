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

    // Kept for consistency, though UserService uses findById and filters deletion
    Optional<User> findByIdAndIsDeletedFalse(UUID id);

    boolean existsByEmail(String email);

    // 1. For UserService.getAllUsers(Pageable pageable)
    Page<User> findByIsDeletedFalse(Pageable pageable);

    // 2. For UserService.searchUsers(null, role, pageable)
    // NOTE: I'm keeping the RolesContaining logic from your original repo, assuming 'roles' is a collection/set.
    Page<User> findByIsDeletedFalseAndRolesContaining(Role role, Pageable pageable);

    // 3. For UserService.searchUsers(search, role, pageable) or (search, null, pageable)
    // This consolidated method uses the powerful JPQL @Query to handle optional search and role filtering.
    // The previous implementation used a hypothetical name that was too long. The @Query is the correct way here.
    @Query("SELECT u FROM User u WHERE " +
            "u.isDeleted = false AND " +
            "(:search IS NULL OR " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:role IS NULL OR :role MEMBER OF u.roles)")
    Page<User> findUsersBySearchAndRole(@Param("search") String search,
                                        @Param("role") Role role,
                                        Pageable pageable);

    // 4. For UserService.countUsersByRole(Role role)
    long countByIsDeletedFalseAndRolesContaining(Role role);

    @Query("""
        SELECT DISTINCT u
        FROM User u
        LEFT JOIN FETCH u.roles r
        WHERE (:search IS NULL OR 
              LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR 
              LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:role IS NULL OR r = :role)
          AND u.isDeleted = false
        """)
    Page<User> searchUsers(@Param("search") String search,
                           @Param("role") Role role,
                           Pageable pageable);
}

