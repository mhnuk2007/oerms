package com.oerms.user.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.user.dto.UserProfileDTO;
import com.oerms.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getUserProfile(@PathVariable Long userId) {
        UserProfileDTO profile = userProfileService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/profile/username/{username}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getUserProfileByUsername(
            @PathVariable String username) {
        UserProfileDTO profile = userProfileService.getUserProfileByUsername(username);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile/{userId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody UserProfileDTO dto) {
        UserProfileDTO profile = userProfileService.updateUserProfile(userId, dto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserProfileDTO>>> getAllUsers() {
        List<UserProfileDTO> users = userProfileService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
