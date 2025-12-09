package com.oerms.user.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.UserProfileDTO;
import com.oerms.common.util.JwtUtils;
import com.oerms.user.dto.*;
import com.oerms.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    /* ============================================================
       GET Endpoints
    ============================================================ */

    /**
     * Get all user profiles (for admin dashboard)
     * This is the endpoint that was missing!
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ProfileSummaryResponse>>> getUserProfiles(Pageable pageable) {
        log.debug("Admin fetching all user profiles with pagination: {}", pageable);
        return ResponseEntity.ok(ApiResponse.success(userProfileService.getAllProfiles(pageable)));
    }

    @GetMapping("/profile/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getMyProfile(Authentication authentication) {

        UUID userId = JwtUtils.getUserId(authentication);
        log.debug("Fetching profile for userId={}", userId);

        UserProfileDTO dto = userProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/profile/{userId}")
    @PreAuthorize("#userId.toString() == authentication.principal.claims['userId'].toString() or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getProfileByUserId(@PathVariable UUID userId) {

        log.debug("Fetching profile for userId={}", userId);
        return ResponseEntity.ok(ApiResponse.success(userProfileService.getProfileByUserId(userId)));
    }

    @GetMapping("/profiles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ProfileSummaryResponse>>> getAllProfiles(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(userProfileService.getAllProfiles(pageable)));
    }

    @GetMapping("/profiles/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ProfileSummaryResponse>>> searchProfiles(
            @RequestParam String keyword, Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success(userProfileService.searchProfiles(keyword, pageable)));
    }

    @GetMapping("/profiles/city/{city}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ProfileSummaryResponse>>> getProfilesByCity(
            @PathVariable String city, Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success(userProfileService.getProfilesByCity(city, pageable)));
    }

    @GetMapping("/profiles/institution/{institution}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ProfileSummaryResponse>>> getProfilesByInstitution(
            @PathVariable String institution, Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success(userProfileService.getProfilesByInstitution(institution, pageable)));
    }

    /* ============================================================
       UPDATE PROFILE
    ============================================================ */

    @PutMapping("/profile/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        UUID userId = JwtUtils.getUserId(authentication);
        log.debug("Updating profile for userId={}", userId);

        UserProfileDTO updated = userProfileService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    /* ============================================================
       Profile Picture Upload/Delete
    ============================================================ */

    @PostMapping(value = "/profile/me/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadMyProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        UUID userId = JwtUtils.getUserId(authentication);

        try {
            log.debug("Uploading picture for userId={}", userId);
            FileUploadResponse response = userProfileService.uploadProfilePicture(userId, file);
            return ResponseEntity.ok(ApiResponse.success("Picture uploaded successfully", response));

        } catch (IOException e) {
            log.error("File upload error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to upload", null));
        }
    }

    @DeleteMapping("/profile/me/picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> deleteMyProfilePicture(Authentication authentication) {

        UUID userId = JwtUtils.getUserId(authentication);
        userProfileService.deleteProfilePicture(userId);

        return ResponseEntity.ok(ApiResponse.success("Profile picture deleted successfully"));
    }

    /* ============================================================
       Institution
    ============================================================ */

    @PutMapping("/profile/me/institution")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> updateMyInstitution(
            @Valid @RequestBody InstitutionRequest request,
            Authentication authentication) {

        UUID userId = JwtUtils.getUserId(authentication);
        log.debug("Setting institution={} for userId={}", request.getInstitution(), userId);

        userProfileService.addInstitution(userId, request.getInstitution());
        return ResponseEntity.ok(ApiResponse.success("Institution updated successfully"));
    }

    @DeleteMapping("/profile/me/institution")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> removeMyInstitution(Authentication authentication) {

        UUID userId = JwtUtils.getUserId(authentication);
        userProfileService.removeInstitution(userId);

        return ResponseEntity.ok(ApiResponse.success("Institution removed successfully"));
    }

    /* ============================================================
       Profile Status
    ============================================================ */

    @PutMapping("/{userId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> activateProfile(@PathVariable UUID userId) {
        userProfileService.activateProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile activated"));
    }

    @PutMapping("/{userId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deactivateProfile(@PathVariable UUID userId) {
        userProfileService.deactivateProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile deactivated"));
    }

    /* ============================================================
       Stats
    ============================================================ */

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileStatsResponse>> getStats() {

        UserProfileStatsResponse stats = UserProfileStatsResponse.builder()
                .total(userProfileService.getTotalProfilesCount())
                .active(userProfileService.getActiveProfilesCount())
                .completed(userProfileService.getCompletedProfilesCount())
                .incomplete(userProfileService.getIncompleteProfilesCount())
                .build();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}