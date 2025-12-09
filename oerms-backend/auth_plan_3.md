# `auth-server` Module Plan (Part 3)

This document outlines the planned structure and contents of the `auth-server` module.

## Entities

### `User.java` (Updated)

```java
package com.oerms.auth.entity;

import com.oerms.common.entity.BaseEntity;
import com.oerms.common.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "user_name"),
    @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "user_name", nullable = false, unique = true, length = 50)
    private String userName;

    @Column(nullable = false, unique = true, length = 50)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private boolean accountNonExpired = true;

    @Column(nullable = false)
    private boolean accountNonLocked = true;

    @Column(nullable = false)
    private boolean credentialsNonExpired = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Set<Role> roles;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;
}
```

## Services

### `AuthService.java` (Updated)

```java
package com.oerms.auth.service;

import com.oerms.auth.dto.RegisterRequest;
import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.entity.User;
import com.oerms.auth.mapper.UserMapper;
import com.oerms.auth.repository.UserRepository;
import com.oerms.common.dto.UserCreatedEvent;
import com.oerms.common.enums.Role;
import com.oerms.common.exception.ResourceAlreadyExistsException;
import com.oerms.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final KafkaTemplate<String, UserCreatedEvent> kafkaTemplate;
    private final UserMapper userMapper;

    @Transactional
    public UserResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByUserName(request.getUserName())) {
            throw new ResourceAlreadyExistsException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
            .userName(request.getUserName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .enabled(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .roles(request.getRoles() != null && !request.getRoles().isEmpty()
                ? request.getRoles()
                : Set.of(Role.STUDENT))
            .build();

        user = userRepository.save(user);
        log.info("User registered: {} with roles: {}", user.getUserName(), user.getRoles());

        // Publish event for profile creation
        UserCreatedEvent event = UserCreatedEvent.builder()
            .userId(user.getId())
            .username(user.getUserName())
            .email(user.getEmail())
            .build();

        kafkaTemplate.send("user-events", "user.created", event);
        log.info("User created event published for userId: {}", user.getId());

        return userMapper.toUserResponse(user);
    }

    @Transactional
    public void updateLastLogin(String username) {
        userRepository.findByUserName(username).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
            log.debug("Updated last login for user: {}", username);
        });
    }

    @Transactional
    public UserResponse assignRole(UUID userId, Role role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.getRoles().add(role);
        user = userRepository.save(user);
        log.info("Role {} assigned to userId: {}", role, userId);

        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse removeRole(UUID userId, Role role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRoles().size() == 1) {
            throw new IllegalStateException("User must have at least one role");
        }

        user.getRoles().remove(role);
        user = userRepository.save(user);
        log.info("Role {} removed from userId: {}", role, userId);

        return userMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUserName(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toUserResponse(user);
    }
}
```

## Mappers

### `UserMapper.java` (New)

```java
package com.oerms.auth.mapper;

import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "userName", source = "userName")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "enabled", source = "enabled")
    @Mapping(target = "accountNonExpired", source = "accountNonExpired")
    @Mapping(target = "accountNonLocked", source = "accountNonLocked")
    @Mapping(target = "credentialsNonExpired", source = "credentialsNonExpired")
    @Mapping(target = "roles", source = "roles")
    @Mapping(target = "lastLogin", source = "lastLogin")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    UserResponse toUserResponse(User user);
}
```

## Controllers

### `AuthController.java` (Updated)

```java
package com.oerms.auth.controller;

import com.oerms.auth.dto.RegisterRequest;
import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.service.AuthService;
import com.oerms.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserDetailsService userDetailsService;
    private final SecurityContextRepository securityContextRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        UserResponse userResponse = authService.registerUser(request);

        // Auto-login: Create authenticated session
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUserName());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities()
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        // Update last login
        authService.updateLastLogin(request.getUserName());

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("user", userResponse);
        responseData.put("message", "Registration successful. You are now logged in.");
        responseData.put("redirectUrl", "/oauth2/authorize?response_type=code&client_id=oerms-client&scope=openid%20profile%20read%20write&redirect_uri=http://localhost:8080/authorized");

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("User registered successfully", responseData));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Not authenticated"));
        }

        UserResponse user = authService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
```

### `RoleController.java` (Updated)

```java
package com.oerms.auth.controller;

import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.service.AuthService;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth/roles")
@RequiredArgsConstructor
public class RoleController {

    private final AuthService authService;

    @PostMapping("/{userId}/assign/{role}")
    @PreAuthorize("hasAuthority('user:manage') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> assignRole(
            @PathVariable UUID userId,
            @PathVariable Role role) {
        UserResponse user = authService.assignRole(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", user));
    }

    @DeleteMapping("/{userId}/remove/{role}")
    @PreAuthorize("hasAuthority('user:manage') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> removeRole(
            @PathVariable UUID userId,
            @PathVariable Role role) {
        UserResponse user = authService.removeRole(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Role removed successfully", user));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('user:manage') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID userId) {
        UserResponse user = authService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
```

## Security

### `CustomUserDetailsService.java` (Updated)

```java
package com.oerms.auth.security;

import com.oerms.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUserName(username)
            .map(CustomUserDetails::from)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
```

## Configuration

### `TokenCustomizerConfig.java` (New)

```java
package com.oerms.auth.config;

import com.oerms.auth.security.CustomUserDetails;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;

@Configuration
public class TokenCustomizerConfig {

    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> jwtCustomizer(UserDetailsService userDetailsService) {
        return context -> {
            if (context.getPrincipal() != null) {
                var userDetails = (CustomUserDetails)
                    userDetailsService.loadUserByUsername(context.getPrincipal().getName());

                // Add custom claims
                context.getClaims().claim("userId", userDetails.getUserId().toString());
                context.getClaims().claim("username", userDetails.getUsername());
                context.getClaims().claim("authorities",
                    userDetails.getAuthorities().stream()
                        .map(a -> a.getAuthority())
                        .toList()
                );
            }
        };
    }
}
```

## Database Migrations

### `V1__init_schema.sql` (Updated)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by VARCHAR(50),
    last_modified_by VARCHAR(50),
    version BIGINT
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_user_name ON users(user_name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_login ON users(last_login);
```

## Exception Handling

### `GlobalExceptionHandler.java` (Updated)

```java
package com.oerms.auth.exception;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.exception.ResourceAlreadyExistsException;
import com.oerms.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceAlreadyExists(ResourceAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Validation failed", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("An error occurred: " + ex.getMessage()));
    }
}
```

## DTOs

### `ApiResponse.java` (Updated)

```java
package com.oerms.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String path;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, T data) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
```

## Testing Examples

### 1. Register with Custom DTOs

**Request:**
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "userName": "john.doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userName": "john.doe",
      "email": "john.doe@example.com",
      "enabled": true,
      "accountNonExpired": true,
      "accountNonLocked": true,
      "credentialsNonExpired": true,
      "roles": ["STUDENT"],
      "lastLogin": "2025-11-25T10:30:00",
      "createdAt": "2025-11-25T10:30:00",
      "updatedAt": "2025-11-25T10:30:00"
    },
    "message": "Registration successful. You are now logged in.",
    "redirectUrl": "/oauth2/authorize?..."
  },
  "timestamp": "2025-11-25T10:30:00"
}
```

### 2. Get Current User

**Request:**
```http
GET http://localhost:8080/api/auth/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "john.doe",
    "email": "john.doe@example.com",
    "enabled": true,
    "roles": ["STUDENT"],
    "lastLogin": "2025-11-25T10:30:00"
  }
}
```

### 3. Admin Assigns Teacher Role

**Request:**
```http
POST http://localhost:8080/api/auth/roles/{userId}/assign/TEACHER
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Role assigned successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "john.doe",
    "email": "john.doe@example.com",
    "roles": ["STUDENT", "TEACHER"]
  }
}
```

### 4. Validation Error Example

**Request:**
```http
POST http://localhost:8080/api/auth/register

{
  "userName": "jd",
  "email": "invalid-email",
  "password": "short"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "userName": "Full name must be between 2 and 100 characters",
    "email": "Invalid email format",
    "password": "Password must be between 8 and 100 characters"
  },
  "timestamp": "2025-11-25T10:30:00"
}
```
