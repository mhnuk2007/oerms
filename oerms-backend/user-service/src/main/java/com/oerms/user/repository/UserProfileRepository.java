package com.oerms.user.repository;

import com.oerms.user.entity.UserProfile;
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
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

    // Basic lookups
    Optional<UserProfile> findByUserId(UUID userId);
    Optional<UserProfile> findByEmail(String email);
    boolean existsByUserId(UUID userId);
    boolean existsByEmail(String email);

    // Active profiles
    List<UserProfile> findByIsActiveTrue();
    Page<UserProfile> findByIsActiveTrue(Pageable pageable);

    // City queries
    List<UserProfile> findByCityAndIsActiveTrue(String city);
    Page<UserProfile> findByCityAndIsActiveTrue(String city, Pageable pageable);

    // Institution queries (single institution field)
    List<UserProfile> findByInstitutionAndIsActiveTrue(String institution);
    Page<UserProfile> findByInstitutionAndIsActiveTrue(String institution, Pageable pageable);

    // Search query
    @Query("SELECT p FROM UserProfile p WHERE " +
            "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<UserProfile> searchProfiles(@Param("keyword") String keyword, Pageable pageable);

    // Statistics
    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.profileCompleted = true")
    long countCompletedProfiles();

    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.isActive = true")
    long countActiveProfiles();

    long countByProfileCompletedFalse();

    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.isActive = true AND p.profileCompleted = true")
    long countActiveAndCompletedProfiles();

    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.createdAt >= :startDate")
    long countProfilesCreatedAfter(@Param("startDate") LocalDateTime startDate);

    // Additional queries
    List<UserProfile> findByProfileCompletedFalse();
    Page<UserProfile> findByProfileCompletedFalse(Pageable pageable);

    @Query("SELECT p FROM UserProfile p WHERE p.city IN :cities AND p.isActive = true")
    List<UserProfile> findByCities(@Param("cities") List<String> cities);
}
