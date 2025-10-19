package com.oerms.userservice.controller;

import com.oerms.userservice.dto.*;
import com.oerms.userservice.service.AuthenticationService;
import com.oerms.userservice.service.JwtService;
import com.oerms.userservice.service.TokenBlacklistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Authentication Controller
 * Handles login, logout, token refresh, and token validation
 *
 * @author OERMS Team
 */
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtService jwtService;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authenticationService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Generate new access token using refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authenticationService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user and invalidate refresh token")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-Auth-Token") String token) {

        // Add current token to blacklist
        if (token != null && !token.isEmpty()) {
            // Calculate remaining token validity
            long remainingValidity = jwtService.getRemainingValidity(token);
            if (remainingValidity > 0) {
                tokenBlacklistService.blacklistToken(token, remainingValidity);
            }
        }

        // Delete refresh token from database
        authenticationService.logout(UUID.fromString(userId));

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate token", description = "Validate JWT token (used by API Gateway)")
    public ResponseEntity<TokenValidationResponse> validateToken(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(
                    TokenValidationResponse.builder()
                            .valid(false)
                            .message("Invalid authorization header")
                            .build()
            );
        }

        String token = authHeader.substring(7);

        // Check if token is valid (signature and expiration)
        if (!jwtService.validateToken(token)) {
            return ResponseEntity.ok(
                    TokenValidationResponse.builder()
                            .valid(false)
                            .message("Invalid or expired token")
                            .build()
            );
        }

        // Check if token is blacklisted
        if (tokenBlacklistService.isBlacklisted(token)) {
            return ResponseEntity.ok(
                    TokenValidationResponse.builder()
                            .valid(false)
                            .message("Token has been revoked")
                            .build()
            );
        }

        // Token is valid
        return ResponseEntity.ok(
                TokenValidationResponse.builder()
                        .valid(true)
                        .message("Token is valid")
                        .build()
        );
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get currently authenticated user from token")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Roles") String roles) {

        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "email", email,
                "roles", roles.split(",")
        ));
    }
}