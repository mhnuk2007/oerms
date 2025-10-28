package com.oerms.auth.controller;

import com.oerms.auth.dto.LoginRequest;
import com.oerms.auth.dto.TokenResponse;
import com.oerms.auth.entity.User;
import com.oerms.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            // Get user details from database
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String accessToken = generateAccessToken(authentication, user);
            String refreshToken = generateRefreshToken(authentication, user);

            // Build response according to API spec
            Map<String, Object> response = new HashMap<>();
            response.put("token", accessToken);
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId().toString());
            userInfo.put("email", user.getEmail());
            userInfo.put("roles", new ArrayList<>(user.getRoles()));
            userInfo.put("name", user.getName());
            
            response.put("user", userInfo);

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "INVALID_CREDENTIALS");
            error.put("message", "Invalid email or password");
            error.put("timestamp", Instant.now().toString());
            error.put("path", "/api/auth/login");
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            
            // TODO: Validate refresh token properly
            // For now, generate new access token
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", "new_access_token"); // Generate new token
            response.put("expiresIn", 86400);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "INVALID_TOKEN");
            error.put("message", "Invalid refresh token");
            error.put("timestamp", Instant.now().toString());
            error.put("path", "/api/auth/refresh");
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        // TODO: Implement token blacklisting
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        
        return ResponseEntity.ok(response);
    }

    private String generateAccessToken(Authentication authentication, User user) {
        Instant now = Instant.now();
        
        // Roles as space-separated string for scope claim
        String scope = user.getRoles().stream()
                .map(role -> "ROLE_" + role)
                .collect(Collectors.joining(" "));
        
        // Roles as comma-separated string for roles claim
        String roles = String.join(",", user.getRoles());
        
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("http://localhost:9000")
                .issuedAt(now)
                .expiresAt(now.plus(24, ChronoUnit.HOURS))
                .subject(user.getEmail())
                .claim("scope", scope)
                .claim("roles", roles)
                .claim("email", user.getEmail())
                .claim("userId", user.getId().toString())
                .claim("name", user.getName())
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    private String generateRefreshToken(Authentication authentication, User user) {
        Instant now = Instant.now();
        
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("http://localhost:9000")
                .issuedAt(now)
                .expiresAt(now.plus(7, ChronoUnit.DAYS))
                .subject(user.getEmail())
                .claim("type", "refresh")
                .claim("email", user.getEmail())
                .claim("userId", user.getId().toString())
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}