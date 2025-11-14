package com.oerms.user.service;

import com.oerms.user.client.AuthServiceClient;
import com.oerms.user.dto.UserProfileDTO;
import com.oerms.user.entity.UserProfile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileService {

    private final UserSyncService userSyncService;
    private final AuthServiceClient authServiceClient;

    public UserProfileDTO getUserProfile(Long userId) {
        try {
            // Try cache/replica first
            UserProfile profile = userSyncService.getUser(userId);
            return mapToDTO(profile);
        } catch (Exception e) {
            // Fallback to auth-server if cache miss or sync issue
            log.warn("User profile not in cache for user: {}, fetching from auth-server", userId);
            return authServiceClient.getUser(userId);
        }
    }

    public UserProfileDTO getUserProfileByUsername(String username) {
        try {
            UserProfile profile = userSyncService.getUserByUsername(username);
            return mapToDTO(profile);
        } catch (Exception e) {
            log.warn("User profile not in cache for username: {}, fetching from auth-server", username);
            return authServiceClient.getUserByUsername(username);
        }
    }

    public List<UserProfileDTO> getAllUsers() {
        List<UserProfile> profiles = userSyncService.getAllUsers();
        return profiles.stream().map(this::mapToDTO).toList();
    }

    // Delegate write operations to auth-server
    public UserProfileDTO updateUserProfile(Long userId, UserProfileDTO dto) {
        return authServiceClient.updateUser(userId, dto);
    }

    private UserProfileDTO mapToDTO(UserProfile profile) {
        return UserProfileDTO.builder()
            .id(profile.getId())
            .username(profile.getUsername())
            .email(profile.getEmail())
            .firstName(profile.getFirstName())
            .lastName(profile.getLastName())
            .phone(profile.getPhone())
            .bio(profile.getBio())
            .profileImageUrl(profile.getProfileImageUrl())
            .dateOfBirth(profile.getDateOfBirth())
            .address(profile.getAddress())
            .city(profile.getCity())
            .state(profile.getState())
            .country(profile.getCountry())
            .roles(profile.getRoles())
            .enabled(profile.getEnabled())
            .build();
    }
}
