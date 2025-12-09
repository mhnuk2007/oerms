package com.oerms.user.service;

import com.oerms.common.dto.UserProfileDTO;
import com.oerms.common.event.UserProfileCreatedEvent;
import com.oerms.common.event.UserProfileUpdatedEvent;
import com.oerms.common.event.UserRegisteredEvent;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.user.dto.*;
import com.oerms.user.entity.UserProfile;
import com.oerms.user.kafka.UserProfileEventProducer;
import com.oerms.user.mapper.UserProfileMapper;
import com.oerms.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository profileRepository;
    private final UserProfileMapper profileMapper;
    private final FileStorageService fileStorageService;
    private final UserProfileEventProducer eventProducer;

    @Override
    @Transactional
    public UserProfileDTO createProfileFromEvent(UserRegisteredEvent event) {
        log.debug("Creating profile from event for userId: {}", event.getUserId());

        if (profileRepository.existsByUserId(event.getUserId())) {
            return getProfileByUserId(event.getUserId());
        }

        UserProfile profile = UserProfile.builder()
                .userId(event.getUserId())
                .email(event.getEmail())
                .isActive(true)
                .profileCompleted(false)
                .build();

        UserProfile savedProfile = profileRepository.save(profile);

        UserProfileCreatedEvent createdEvent = profileMapper.toCreatedEvent(savedProfile);
        createdEvent.setUserId(event.getUserId());
        eventProducer.publishProfileCreatedEvent(createdEvent);

        return profileMapper.toDTO(savedProfile);
    }

    @Override
    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public UserProfileDTO updateProfile(UUID userId, UpdateProfileRequest request) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));


        if(request.getFirstName()!=null) profile.setFirstName(request.getFirstName());
        if(request.getLastName()!=null) profile.setLastName(request.getLastName());
        if(request.getEmail()!=null) profile.setEmail(request.getEmail());
        if(request.getCity()!=null) profile.setCity(request.getCity());
        if(request.getInstitution()!=null) profile.setInstitution(request.getInstitution());

        profile.checkProfileCompletion();
        UserProfile updatedProfile = profileRepository.save(profile);

        UserProfileUpdatedEvent event = profileMapper.toUpdatedEvent(updatedProfile);
        event.setUserId(userId);
        eventProducer.publishProfileUpdatedEvent(event);

        return profileMapper.toDTO(updatedProfile);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "userProfiles", key = "#userId")
    public UserProfileDTO getProfileByUserId(UUID userId) {
        return profileRepository.findByUserId(userId)
                .map(profileMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDTO getProfileById(UUID profileId) {
        return profileRepository.findById(profileId)
                .map(profileMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with id: " + profileId));
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDTO getProfileByEmail(String email) {
        return profileRepository.findByEmail(email)
                .map(profileMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with email: " + email));
    }

    @Override
    public boolean existsByUserId(UUID userId) {
        return profileRepository.existsByUserId(userId);
    }

    @Override
    public Page<ProfileSummaryResponse> getAllProfiles(Pageable pageable) {
        return profileRepository.findByIsActiveTrue(pageable)
                .map(profileMapper::toSummaryResponse);
    }

    @Override
    public Page<ProfileSummaryResponse> searchProfiles(String keyword, Pageable pageable) {
        return profileRepository.searchProfiles(keyword, pageable)
                .map(profileMapper::toSummaryResponse);
    }

    @Override
    public Page<ProfileSummaryResponse> getProfilesByCity(String city, Pageable pageable) {
        return profileRepository.findByCityAndIsActiveTrue(city, pageable)
                .map(profileMapper::toSummaryResponse);
    }

    @Override
    public Page<ProfileSummaryResponse> getProfilesByInstitution(String institution, Pageable pageable) {
        return profileRepository.findByInstitutionAndIsActiveTrue(institution, pageable)
                .map(profileMapper::toSummaryResponse);
    }

    @Override
    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public FileUploadResponse uploadProfilePicture(UUID userId, MultipartFile file) throws IOException {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        if (profile.getProfilePictureUrl() != null && !profile.getProfilePictureUrl().isBlank()) {
            fileStorageService.deleteFile(profile.getProfilePictureUrl());
        }

        String fileUrl = fileStorageService.storeFile(file, userId);
        profile.setProfilePictureUrl(fileUrl);
        profileRepository.save(profile);

        return FileUploadResponse.builder()
                .fileName(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .uploadedAt(java.time.LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public void deleteProfilePicture(UUID userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        if (profile.getProfilePictureUrl() != null && !profile.getProfilePictureUrl().isBlank()) {
            fileStorageService.deleteFile(profile.getProfilePictureUrl());
            profile.setProfilePictureUrl(null);
            profileRepository.save(profile);
        }
    }

    // ===== SINGLE INSTITUTION METHODS =====
    @Override
    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public void addInstitution(UUID userId, String institution) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        profile.setInstitution(institution); // single institution
        profile.checkProfileCompletion();
        profileRepository.save(profile);
    }

    @Override
    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public void removeInstitution(UUID userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        profile.setInstitution(null);
        profile.checkProfileCompletion();
        profileRepository.save(profile);
    }

    @Override
    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public void activateProfile(UUID userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        profile.setIsActive(true);
        profileRepository.save(profile);
    }

    @Override
    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public void deactivateProfile(UUID userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        profile.setIsActive(false);
        profileRepository.save(profile);
    }

    @Override
    public long getTotalProfilesCount() {
        return profileRepository.count();
    }

    @Override
    public long getCompletedProfilesCount() {
        return profileRepository.countCompletedProfiles();
    }

    @Override
    public long getActiveProfilesCount() {
        return profileRepository.countActiveProfiles();
    }

    @Override
    public long getIncompleteProfilesCount() {
        return profileRepository.countByProfileCompletedFalse();
    }
}