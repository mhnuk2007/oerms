package com.oerms.user.service;

import com.oerms.common.dto.UserProfileDTO;
import com.oerms.common.event.UserRegisteredEvent;
import com.oerms.user.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

public interface UserProfileService {

    // Create profile from registration event
    UserProfileDTO createProfileFromEvent(UserRegisteredEvent event);

    // Update profile
    UserProfileDTO updateProfile(UUID userId, UpdateProfileRequest request);

    // Fetch profile
    UserProfileDTO getProfileByUserId(UUID userId);
    UserProfileDTO getProfileById(UUID profileId);
    UserProfileDTO getProfileByEmail(String email);

    boolean existsByUserId(UUID userId);

    // Profile queries
    Page<ProfileSummaryResponse> getAllProfiles(Pageable pageable);
    Page<ProfileSummaryResponse> searchProfiles(String keyword, Pageable pageable);
    Page<ProfileSummaryResponse> getProfilesByCity(String city, Pageable pageable);
    Page<ProfileSummaryResponse> getProfilesByInstitution(String institution, Pageable pageable);

    // File management
    FileUploadResponse uploadProfilePicture(UUID userId, MultipartFile file) throws IOException;
    void deleteProfilePicture(UUID userId);

    // Institution management (single institution per user)
    void addInstitution(UUID userId, String institution);
    void removeInstitution(UUID userId); // no parameter needed

    // Profile status
    void activateProfile(UUID userId);
    void deactivateProfile(UUID userId);

    // Statistics
    long getTotalProfilesCount();
    long getCompletedProfilesCount();
    long getActiveProfilesCount();
    long getIncompleteProfilesCount();
}
