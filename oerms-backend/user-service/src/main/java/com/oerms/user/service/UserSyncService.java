//package com.oerms.user.service;
//
//import com.oerms.common.event.UserEvent;
//import com.oerms.common.exception.ResourceNotFoundException;
//import com.oerms.user.entity.UserProfile;
//import com.oerms.user.repository.UserProfileRepository;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.cache.annotation.CacheEvict;
//import org.springframework.cache.annotation.Cacheable;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class UserSyncService {
//
//    private final UserProfileRepository userProfileRepository;
//
//    @KafkaListener(topics = "user-events", groupId = "user-service")
//    @Transactional
//    public void handleUserEvent(UserEvent event) {
//        log.info("Received user event: {} for user: {}", event.getEventType(), event.getUserId());
//
//        try {
//            switch (event.getEventType()) {
//                case "user.created":
//                case "user.updated":
//                    syncUser(event);
//                    break;
//                case "user.deleted":
//                    deleteUser(event.getUserId());
//                    break;
//                default:
//                    log.warn("Unknown event type: {}", event.getEventType());
//            }
//        } catch (Exception e) {
//            log.error("Error processing user event: {} for user: {}", event.getEventType(), event.getUserId(), e);
//        }
//    }
//
//    @Transactional
//    @CacheEvict(value = "userProfiles", key = "#event.userId")
//    public void syncUser(UserEvent event) {
//        UserProfile userProfile = userProfileRepository.findById(event.getUserId())
//                .orElse(new UserProfile());
//
//        userProfile.setId(event.getUserId());
//        userProfile.setUserName(event.getUserName());
//        userProfile.setEmail(event.getEmail());
//        userProfile.setFirstName(event.getFirstName());
//        userProfile.setLastName(event.getLastName());
//        userProfile.setPhone(event.getPhone());
//        userProfile.setBio(event.getBio());
//        userProfile.setProfileImageUrl(event.getProfileImageUrl());
//        userProfile.setAddress(event.getAddress());
//        userProfile.setCity(event.getCity());
//        userProfile.setState(event.getState());
//        userProfile.setCountry(event.getCountry());
//
//        userProfileRepository.save(userProfile);
//        log.info("User profile synced for user: {}", event.getUserId());
//    }
//
//    @Transactional
//    @CacheEvict(value = "userProfiles", key = "#userId")
//    public void deleteUser(UUID userId) {
//        if (userProfileRepository.existsById(userId)) {
//            userProfileRepository.deleteById(userId);
//            log.info("User profile deleted for user: {}", userId);
//        }
//    }
//
//    @Cacheable(value = "userProfiles", key = "#userId")
//    public UserProfile getUser(UUID userId) {
//        return userProfileRepository.findById(userId)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
//    }
//
//    @Cacheable(value = "userProfiles", key = "#userName")
//    public UserProfile getUserByUserName(String userName) {
//        return userProfileRepository.findByUserName(userName)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userName));
//    }
//
//    public List<UserProfile> getAllUsers() {
//        return userProfileRepository.findAll();
//    }
//}