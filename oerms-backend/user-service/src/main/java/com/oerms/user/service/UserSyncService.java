package com.oerms.user.service;

import com.oerms.common.event.UserEvent;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.user.entity.UserProfile;
import com.oerms.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSyncService {

    private final UserProfileRepository userProfileRepository;

    /**
     * Kafka listener for user-events topic.
     * Consumes UserEvent objects published by auth-service.
     */
    @KafkaListener(topics = "user-events", groupId = "user-service")
    @Transactional
    public void handleUserEvent(UserEvent event) {
        log.info("Received user event: {} for user: {}", event.getEventType(), event.getUserId());

        try {
            switch (event.getEventType()) {
                case "user.created":
                case "user.updated":
                    syncUser(event);
                    break;
                case "user.deleted":
                    deleteUser(event.getUserId());
                    break;
                default:
                    log.warn("Unknown event type: {}", event.getEventType());
            }
        } catch (Exception e) {
            log.error("Error processing user event: {} for user: {}", event.getEventType(), event.getUserId(), e);
            // Consider DLQ or retry logic here
        }
    }

    /**
     * Sync user profile from UserEvent into local DB.
     */
    @Transactional
    @CacheEvict(value = "userProfiles", key = "#event.userId")
    public void syncUser(UserEvent event) {
        UserProfile userProfile = userProfileRepository.findById(event.getUserId())
                .orElse(new UserProfile());

        userProfile.setId(event.getUserId());
        userProfile.setUsername(event.getUsername());
        userProfile.setEmail(event.getEmail());
        userProfile.setFirstName(event.getFirstName());
        userProfile.setLastName(event.getLastName());
        userProfile.setPhone(event.getPhone());
        userProfile.setBio(event.getBio());
        userProfile.setProfileImageUrl(event.getProfileImageUrl());
        userProfile.setAddress(event.getAddress());
        userProfile.setCity(event.getCity());
        userProfile.setState(event.getState());
        userProfile.setCountry(event.getCountry());
        userProfile.setEnabled(event.getEnabled());
        userProfile.setRoles(event.getRoles());
        userProfile.setDateOfBirth(event.getDateOfBirth());
        userProfile.setSyncedAt(event.getTimestamp());

        userProfileRepository.save(userProfile);
        log.info("User profile synced for user: {}", event.getUserId());
    }

    /**
     * Delete user profile when user.deleted event is received.
     */
    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public void deleteUser(Long userId) {
        if (userProfileRepository.existsById(userId)) {
            userProfileRepository.deleteById(userId);
            log.info("User profile deleted for user: {}", userId);
        }
    }

    /**
     * Get user profile by ID with caching.
     * Returns entity; UserProfileService maps to DTO.
     */
    @Cacheable(value = "userProfiles", key = "#userId")
    public UserProfile getUser(Long userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    /**
     * Get user profile by username with caching.
     * Returns entity; UserProfileService maps to DTO.
     */
    @Cacheable(value = "userProfiles", key = "#username")
    public UserProfile getUserByUsername(String username) {
        return userProfileRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    /**
     * Get all user profiles.
     * Returns entities; UserProfileService maps to DTO.
     */
    public List<UserProfile> getAllUsers() {
        return userProfileRepository.findAll();
    }
}
