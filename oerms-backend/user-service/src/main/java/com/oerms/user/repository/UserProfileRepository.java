package com.oerms.user.repository;

import com.oerms.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
Optional<UserProfile> findByUsername(String username);
Optional<UserProfile> findByEmail(String email);
boolean existsById(Long id);
}
