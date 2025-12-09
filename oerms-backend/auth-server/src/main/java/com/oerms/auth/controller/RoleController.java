package com.oerms.auth.controller;

import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.service.AuthService;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {

    private final AuthService authService;

    @PostMapping("/{userId}/assign/{role}")
    @PreAuthorize("hasAuthority('user:manage') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> assignRole(
            @PathVariable UUID userId,
            @PathVariable Role role) {

        log.info("Assigning role {} to user {}", role, userId);
        UserResponse user = authService.assignRole(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", user));
    }

    @DeleteMapping("/{userId}/remove/{role}")
    @PreAuthorize("hasAuthority('user:manage') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> removeRole(
            @PathVariable UUID userId,
            @PathVariable Role role) {

        log.info("Removing role {} from user {}", role, userId);
        UserResponse user = authService.removeRole(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Role removed successfully", user));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('user:manage') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID userId) {

        log.info("Fetching user with id {}", userId);
        UserResponse user = authService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
