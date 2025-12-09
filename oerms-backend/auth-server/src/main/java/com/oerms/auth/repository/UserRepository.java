package com.oerms.auth.repository;

import com.oerms.auth.entity.User;
import com.oerms.common.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUserName(String userName);

    Optional<User> findByEmail(String email);

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role")
    List<User> findByRole(@Param("role") Role role);

    Page<User> findByEnabledTrue(Pageable pageable);

    Page<User> findByEnabledFalse(Pageable pageable);

    // Search users by username or email for pagination
    Page<User> findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String userName, String email, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = true")
    long countActiveUsers();

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r = :role")
    long countByRole(@Param("role") Role role);

    List<User> findByLastLoginBefore(LocalDateTime dateTime);
}
