package com.oerms.user.repository;

import com.oerms.user.entity.User;
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
    boolean existsByEmail(String email);
    
    // Find by role
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role")
    Page<User> findByRolesContaining(@Param("role") String role, Pageable pageable);
    
    // Find by role and name search
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role AND LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<User> findByRolesContainingAndNameContainingIgnoreCase(
            @Param("role") String role, 
            @Param("search") String search, 
            Pageable pageable
    );
    
    // Find by name or email search
    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name, 
            String email, 
            Pageable pageable
    );
}