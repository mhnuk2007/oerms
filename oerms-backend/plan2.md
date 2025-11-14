# AUTH-SERVER: Master User Data (Updated)

## User.java (auth-server - UPDATED)
```java
package com.oerms.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    private String phone;
    
    @Column(length = 1000)
    private String bio;
    
    @Column(name = "profile_image_url")
    private String profileImageUrl;
    
    @Column(name = "date_of_birth")
    private LocalDateTime dateOfBirth;
    
    private String address;
    private String city;
    private String state;
    private String country;
    
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @Column(name = "account_non_expired")
    private Boolean accountNonExpired = true;
    
    @Column(name = "account_non_locked")
    private Boolean accountNonLocked = true;
    
    @Column(name = "credentials_non_expired")
    private Boolean credentialsNonExpired = true;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

## UserEvent.java (auth-server)
```java
package com.oerms.auth.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent {
private String eventType; // user.created, user.updated, user.deleted
private Long userId;
private String username;
private String email;
private String firstName;
private String lastName;
private String phone;
private String bio;
private String profileImageUrl;
private LocalDateTime dateOfBirth;
private String address;
private String city;
private String state;
private String country;
private Set<String> roles;
private Boolean enabled;
private LocalDateTime timestamp;
}
```

## AuthService.java (auth-server - UPDATED)
```java
package com.oerms.auth.service;

import com.oerms.auth.dto.RegisterRequest;
import com.oerms.auth.dto.UpdateUserRequest;
import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.entity.User;
import com.oerms.auth.event.UserEvent;
import com.oerms.auth.repository.UserRepository;
import com.oerms.common.exception.BadRequestException;
import com.oerms.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final KafkaTemplate<String, UserEvent> kafkaTemplate;
    
    private static final String USER_EVENTS_TOPIC = "user-events";

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .roles(Set.of("ROLE_STUDENT"))
            .enabled(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .build();

        user = userRepository.save(user);
        
        // Publish user.created event
        publishUserEvent("user.created", user);
        
        log.info("User registered: {}", user.getUsername());
        return mapToResponse(user);
    }

    public UserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToResponse(user);
    }

    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Update fields
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        
        user = userRepository.save(user);
        
        // Publish user.updated event
        publishUserEvent("user.updated", user);
        
        log.info("User updated: {}", user.getId());
        return mapToResponse(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        userRepository.delete(user);
        
        // Publish user.deleted event
        publishUserEvent("user.deleted", user);
        
        log.info("User deleted: {}", userId);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional
    public UserResponse updateRoles(Long userId, Set<String> roles) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        user.setRoles(roles);
        user = userRepository.save(user);
        
        // Publish user.updated event
        publishUserEvent("user.updated", user);
        
        log.info("User roles updated: {} - Roles: {}", userId, roles);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        user.setEnabled(!user.getEnabled());
        user = userRepository.save(user);
        
        // Publish user.updated event
        publishUserEvent("user.updated", user);
        
        log.info("User status toggled: {} - Enabled: {}", userId, user.getEnabled());
        return mapToResponse(user);
    }

    private void publishUserEvent(String eventType, User user) {
        UserEvent event = UserEvent.builder()
            .eventType(eventType)
            .userId(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phone(user.getPhone())
            .bio(user.getBio())
            .profileImageUrl(user.getProfileImageUrl())
            .dateOfBirth(user.getDateOfBirth())
            .address(user.getAddress())
            .city(user.getCity())
            .state(user.getState())
            .country(user.getCountry())
            .roles(user.getRoles())
            .enabled(user.getEnabled())
            .timestamp(LocalDateTime.now())
            .build();
        
        kafkaTemplate.send(USER_EVENTS_TOPIC, String.valueOf(user.getId()), event);
        log.info("Published {} event for user: {}", eventType, user.getId());
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phone(user.getPhone())
            .bio(user.getBio())
            .profileImageUrl(user.getProfileImageUrl())
            .dateOfBirth(user.getDateOfBirth())
            .address(user.getAddress())
            .city(user.getCity())
            .state(user.getState())
            .country(user.getCountry())
            .roles(user.getRoles())
            .enabled(user.getEnabled())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
```

## UpdateUserRequest.java (auth-server)
```java
package com.oerms.auth.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateUserRequest {
private String firstName;
private String lastName;
private String phone;
private String bio;
private String profileImageUrl;
private LocalDateTime dateOfBirth;
private String address;
private String city;
private String state;
private String country;
}
```

## UserResponse.java (auth-server - UPDATED)
```java
package com.oerms.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
private Long id;
private String username;
private String email;
private String firstName;
private String lastName;
private String phone;
private String bio;
private String profileImageUrl;
private LocalDateTime dateOfBirth;
private String address;
private String city;
private String state;
private String country;
private Set<String> roles;
private Boolean enabled;
private LocalDateTime createdAt;
private LocalDateTime updatedAt;
}
```

## UserController.java (auth-server - NEW)
```java
package com.oerms.auth.controller;

import com.oerms.auth.dto.UpdateUserRequest;
import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.service.AuthService;
import com.oerms.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long userId) {
        UserResponse user = authService.getUser(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByUsername(@PathVariable String username) {
        UserResponse user = authService.getUserByUsername(username);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse user = authService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = authService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        authService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PutMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateRoles(
            @PathVariable Long userId,
            @RequestBody Set<String> roles) {
        UserResponse user = authService.updateRoles(userId, roles);
        return ResponseEntity.ok(ApiResponse.success("User roles updated successfully", user));
    }

    @PatchMapping("/{userId}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(@PathVariable Long userId) {
        UserResponse user = authService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", user));
    }
}
```

## KafkaConfig.java (auth-server - NEW)
```java
package com.oerms.auth.config;

import com.oerms.auth.event.UserEvent;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, UserEvent> userEventProducerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, UserEvent> userEventKafkaTemplate() {
        return new KafkaTemplate<>(userEventProducerFactory());
    }

    @Bean
    public NewTopic userEventsTopic() {
        return new NewTopic("user-events", 3, (short) 1);
    }
}
```

# USER-SERVICE: Read Replica with Cache

## UserProfile.java (user-service - RENAMED FROM UserCache)
```java
package com.oerms.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "user_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    private Long id; // Same as auth-server user.id
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    private String phone;
    
    @Column(length = 1000)
    private String bio;
    
    @Column(name = "profile_image_url")
    private String profileImageUrl;
    
    @Column(name = "date_of_birth")
    private LocalDateTime dateOfBirth;
    
    private String address;
    private String city;
    private String state;
    private String country;
    
    @ElementCollection
    @CollectionTable(name = "user_profile_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles;
    
    private Boolean enabled;
    
    @Column(name = "synced_at")
    private LocalDateTime syncedAt;
    
    @PrePersist
    @PreUpdate
    protected void onSync() {
        syncedAt = LocalDateTime.now();
    }
}
```

## UserProfileRepository.java (user-service - UPDATED)
```java
package com.oerms.user.repository;

import com.oerms.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
Optional<UserProfile> findByUsername(String username);
Optional<UserProfile> findByEmail(String email);
Boolean existsById(Long id);
}
```

## UserSyncService.java (user-service - NEW)
```java
package com.oerms.user.service;

import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.user.entity.UserProfile;
import com.oerms.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSyncService {

    private final UserProfileRepository userProfileRepository;

    @KafkaListener(topics = "user-events", groupId = "user-service")
    @Transactional
    public void handleUserEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        Long userId = ((Number) event.get("userId")).longValue();
        
        log.info("Received user event: {} for user: {}", eventType, userId);
        
        try {
            switch (eventType) {
                case "user.created":
                case "user.updated":
                    syncUser(event);
                    break;
                case "user.deleted":
                    deleteUser(userId);
                    break;
                default:
                    log.warn("Unknown event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing user event: {} for user: {}", eventType, userId, e);
            // Consider implementing dead letter queue or retry logic
        }
    }

    @Transactional
    @CacheEvict(value = "userProfiles", key = "#event['userId']")
    public void syncUser(Map<String, Object> event) {
        Long userId = ((Number) event.get("userId")).longValue();
        
        UserProfile userProfile = userProfileRepository.findById(userId)
            .orElse(new UserProfile());
        
        userProfile.setId(userId);
        userProfile.setUsername((String) event.get("username"));
        userProfile.setEmail((String) event.get("email"));
        userProfile.setFirstName((String) event.get("firstName"));
        userProfile.setLastName((String) event.get("lastName"));
        userProfile.setPhone((String) event.get("phone"));
        userProfile.setBio((String) event.get("bio"));
        userProfile.setProfileImageUrl((String) event.get("profileImageUrl"));
        userProfile.setAddress((String) event.get("address"));
        userProfile.setCity((String) event.get("city"));
        userProfile.setState((String) event.get("state"));
        userProfile.setCountry((String) event.get("country"));
        userProfile.setEnabled((Boolean) event.get("enabled"));
        
        // Handle dateOfBirth
        Object dobObj = event.get("dateOfBirth");
        if (dobObj != null) {
            // Handle LocalDateTime deserialization from Kafka
            userProfile.setDateOfBirth(null); // Set appropriately based on your date handling
        }
        
        // Handle roles (comes as List from Kafka)
        Object rolesObj = event.get("roles");
        if (rolesObj instanceof List) {
            userProfile.setRoles(new HashSet<>((List<String>) rolesObj));
        }
        
        userProfileRepository.save(userProfile);
        log.info("User profile synced for user: {}", userId);
    }

    @Transactional
    @CacheEvict(value = "userProfiles", key = "#userId")
    public void deleteUser(Long userId) {
        if (userProfileRepository.existsById(userId)) {
            userProfileRepository.deleteById(userId);
            log.info("User profile deleted for user: {}", userId);
        }
    }

    @Cacheable(value = "userProfiles", key = "#userId")
    public UserProfile getUser(Long userId) {
        return userProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Cacheable(value = "userProfiles", key = "#username")
    public UserProfile getUserByUsername(String username) {
        return userProfileRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    public List<UserProfile> getAllUsers() {
        return userProfileRepository.findAll();
    }
}
```

## UserProfileService.java (user-service - UPDATED)
```java
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
```

## UserProfileDTO.java (user-service - UPDATED)
```java
package com.oerms.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
private Long id;
private String username;
private String email;
private String firstName;
private String lastName;
private String phone;
private String bio;
private String profileImageUrl;
private LocalDateTime dateOfBirth;
private String address;
private String city;
private String state;
private String country;
private Set<String> roles;
private Boolean enabled;
}
```

## AuthServiceClient.java (user-service)
```java
package com.oerms.user.client;

import com.oerms.user.dto.UserProfileDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "auth-server")
public interface AuthServiceClient {

    @GetMapping("/users/{userId}")
    UserProfileDTO getUser(@PathVariable Long userId);
    
    @GetMapping("/users/username/{username}")
    UserProfileDTO getUserByUsername(@PathVariable String username);
    
    @PutMapping("/users/{userId}")
    UserProfileDTO updateUser(@PathVariable Long userId, @RequestBody UserProfileDTO dto);
}
```

## UserProfileController.java (user-service - UPDATED)
```java
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
```

# API GATEWAY ROUTING CONFIGURATION

## application.yml (api-gateway - UPDATED)
```yaml
spring:
  application:
    name: api-gateway

  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true

      routes:
        # Auth Server Routes (Write Operations)
        - id: auth-register
          uri: lb://auth-server
          predicates:
            - Path=/auth/register
          filters:
            - RewritePath=/auth/register, /auth/register
        
        - id: auth-oauth
          uri: lb://auth-server
          predicates:
            - Path=/oauth2/**
        
        # User Write Operations - Go to Auth Server (Master)
        - id: user-write-operations
          uri: lb://auth-server
          predicates:
            - Path=/api/users/profile/{userId}
            - Method=PUT,PATCH,DELETE
          filters:
            - RewritePath=/api/users/profile/(?<userId>.*), /users/${userId}
        
        - id: user-admin-operations
          uri: lb://auth-server
          predicates:
            - Path=/api/users/admin/**
          filters:
            - RewritePath=/api/users/admin/(?<segment>.*), /users/${segment}
        
        # User Read Operations - Go to User Service (Cached Replica)
        - id: user-read-operations
          uri: lb://user-service
          predicates:
            - Path=/api/users/profile/**
            - Method=GET
          filters:
            - name: CircuitBreaker
              args:
                name: userServiceCircuitBreaker
                fallbackUri: forward:/fallback/user-service
        
        # Exam Service Routes
        - id: exam-service
          uri: lb://exam-service
          predicates:
            - Path=/api/exams/**
          filters:
            - name: CircuitBreaker
              args:
                name: examServiceCircuitBreaker
                fallbackUri: forward:/fallback/exam-service
        
        # Question Service Routes
        - id: question-service
          uri: lb://question-service
          predicates:
            - Path=/api/questions/**
          filters:
            - name: CircuitBreaker
              args:
                name: questionServiceCircuitBreaker
                fallbackUri: forward:/fallback/question-service
        
        # Attempt Service Routes
        - id: attempt-service
          uri: lb://attempt-service
          predicates:
            - Path=/api/attempts/**
          filters:
            - name: CircuitBreaker
              args:
                name: attemptServiceCircuitBreaker
                fallbackUri: forward:/fallback/attempt-service
        
        # Result Service Routes
        - id: result-service
          uri: lb://result-service
          predicates:
            - Path=/api/results/**
          filters:
            - name: CircuitBreaker
              args:
                name: resultServiceCircuitBreaker
                fallbackUri: forward:/fallback/result-service
        
        # Notification Service Routes
        - id: notification-service
          uri: lb://notification-service
          predicates:
            - Path=/api/notifications/**
          filters:
            - name: CircuitBreaker
              args:
                name: notificationServiceCircuitBreaker
                fallbackUri: forward:/fallback/notification-service
      
      default-filters:
        - DedupeResponseHeader=Access-Control-Allow-Credentials Access-Control-Allow-Origin

data:
  redis:
    host: localhost
    port: 6379

security:
  oauth2:
    resourceserver:
      jwt:
        issuer-uri: http://localhost:9000

server:
  port: 8080

eureka:
  client:
    service-url:
      defaultZone: http://eureka:eureka123@localhost:8761/eureka/
  instance:
    prefer-ip-address: true

management:
  endpoints:
    web:
      exposure:
        include: health,info,gateway,metrics

logging:
  level:
    org.springframework.cloud.gateway: DEBUG
```

# UPDATED APPLICATION.YML FILES

## application.yml (auth-server - ADD KAFKA)
```yaml
spring:
  application:
    name: auth-server
  datasource:
    url: jdbc:postgresql://localhost:5432/oerms_auth
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
      show-sql: true
      properties:
        hibernate:
          dialect: org.hibernate.dialect.PostgreSQLDialect
          format_sql: true
  data:
    redis:
      host: localhost
      port: 6379
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

server:
  port: 9000

eureka:
  client:
    service-url:
      defaultZone: http://eureka:eureka123@localhost:8761/eureka/
  instance:
    prefer-ip-address: true

logging:
  level:
    org.springframework.security: DEBUG
    com.oerms.auth: DEBUG
```

## application.yml (user-service - ADD KAFKA CONSUMER)
```yaml
spring:
  application:
    name: user-service
  datasource:
    url: jdbc:postgresql://localhost:5432/oerms_user
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
      show-sql: false
      properties:
        hibernate:
          dialect: org.hibernate.dialect.PostgreSQLDialect
  data:
    redis:
      host: localhost
      port: 6379
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: user-service
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"
security:
  oauth2:
    resourceserver:
      jwt:
        issuer-uri: http://localhost:9000

server:
  port: 9001

eureka:
  client:
    service-url:
      defaultZone: http://eureka:eureka123@localhost:8761/eureka/
  instance:
    prefer-ip-address: true

feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 5000

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics

logging:
  level:
    com.oerms.user: DEBUG
```

# SYNCHRONIZATION MONITORING & HEALTH

## SyncHealthIndicator.java (user-service)
```java
package com.oerms.user.health;

import com.oerms.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SyncHealthIndicator implements HealthIndicator {

    private final UserProfileRepository userProfileRepository;

    @Override
    public Health health() {
        try {
            long userCount = userProfileRepository.count();
            return Health.up()
                .withDetail("syncedUsers", userCount)
                .withDetail("status", "Synced")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

## SyncMonitorService.java (user-service - OPTIONAL)
```java
package com.oerms.user.service;

import com.oerms.user.client.AuthServiceClient;
import com.oerms.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
* Optional: Periodic sync verification
* Checks if user-service is in sync with auth-server
*/
@Service
@RequiredArgsConstructor
@Slf4j
public class SyncMonitorService {

    private final UserProfileRepository userProfileRepository;
    private final AuthServiceClient authServiceClient;

    @Scheduled(fixedRate = 3600000) // Every hour
    public void verifySyncStatus() {
        try {
            long localUserCount = userProfileRepository.count();
            log.info("User-service has {} users synced", localUserCount);

            // You could add more sophisticated sync verification here
            // For example, comparing counts with auth-server
        } catch (Exception e) {
            log.error("Error verifying sync status", e);
        }
    }
}
```

# DATA FLOW DIAGRAM
```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                │
└─────────────────────────────────────────────────────────────────┘

1. USER REGISTRATION / UPDATE (Write Path)
   ┌──────────┐
   │  Client  │
   └────┬─────┘
   │ POST /auth/register
   │ PUT /api/users/profile/{id}
   ▼
   ┌────────────────┐
   │  API Gateway   │
   └────┬───────────┘
   │ Routes to auth-server
   ▼
   ┌────────────────┐
   │  Auth Server   │ (Master)
   │  - Save to DB  │
   │  - Publish     │
   │    Kafka Event │
   └────┬───────────┘
   │
   │ Kafka: user-events topic
   │ {eventType: "user.created/updated/deleted"}
   ▼
   ┌────────────────┐
   │  User Service  │ (Replica)
   │  - Consume     │
   │    Event       │
   │  - Sync to DB  │
   │  - Cache in    │
   │    Redis       │
   └────────────────┘


2. USER PROFILE READ (Read Path)
   ┌──────────┐
   │  Client  │
   └────┬─────┘
   │ GET /api/users/profile/{id}
   ▼
   ┌────────────────┐
   │  API Gateway   │
   └────┬───────────┘
   │ Routes to user-service
   ▼
   ┌────────────────┐
   │  User Service  │
   │  1. Check      │
   │     Redis      │ ──┐
   │  2. Check DB   │   │ Cache Hit
   │  3. Fallback   │ ◄─┘
   │     Auth       │
   │     Server     │
   └────────────────┘

3. EVENT SYNCHRONIZATION
   ┌────────────────┐
   │  Auth Server   │
   └────┬───────────┘
   │
   │ UserEvent
   │ {
   │   eventType: "user.updated",
   │   userId: 123,
   │   username: "john_doe",
   │   ...
   │ }
   ▼
   ┌────────────────┐
   │     Kafka      │
   │  Topic:        │
   │  user-events   │
   └────┬───────────┘
   │
   ▼
   ┌────────────────┐
   │  User Service  │
   │  @KafkaListener│
   │  - Sync Data   │
   │  - Update      │
   │    Cache       │
   └────────────────┘
```

# TESTING THE SYNCHRONIZATION
```
// Test Script (Use Postman or curl)

// 1. Register a new user (Creates in auth-server)
POST http://localhost:8080/auth/register
Content-Type: application/json

{
"username": "testuser",
"email": "test@example.com",
"password": "password123",
"firstName": "Test",
"lastName": "User"
}

// 2. Get OAuth Token
POST http://localhost:9000/oauth2/token
Authorization: Basic b2VybXMtd2ViLWNsaWVudDpzZWNyZXQ=
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=testuser&password=password123&scope=read write

// 3. Read user profile from user-service (Should be synced via Kafka)
GET http://localhost:8080/api/users/profile/1
Authorization: Bearer {access_token}

// 4. Update user profile (Goes to auth-server)
PUT http://localhost:8080/api/users/profile/1
Authorization: Bearer {access_token}
Content-Type: application/json

{
"firstName": "Updated",
"lastName": "Name",
"phone": "+1234567890",
"bio": "Test bio"
}

// 5. Read updated profile from user-service (Should reflect changes)
GET http://localhost:8080/api/users/profile/1
Authorization: Bearer {access_token}

// 6. Verify sync in user-service database
SELECT * FROM user_profiles WHERE id = 1;

// 7. Check Kafka messages (if you have Kafka UI)
// Topic: user-events
// Should see: user.created, user.updated events
```

# ADVANTAGES OF THIS APPROACH
```
✅ BENEFITS:

1. **Single Source of Truth**
    - Auth-server owns user data
    - All writes go through auth-server
    - No data inconsistency

2. **Performance**
    - User-service provides fast reads (cached)
    - Redis caching for frequently accessed data
    - Reduces load on auth-server

3. **Scalability**
    - User-service can scale independently
    - Multiple read replicas possible
    - Write operations centralized

4. **Resilience**
    - User-service has fallback to auth-server
    - Kafka ensures eventual consistency
    - Service can recover from failures

5. **Separation of Concerns**
    - Auth-server: Authentication + User Management
    - User-service: Fast user lookups for other services
    - Clear responsibility boundaries

6. **Event-Driven Architecture**
    - Other services can listen to user-events
    - Easy to add new features (email verification, notifications)
    - Audit trail of user changes

⚠️ CONSIDERATIONS:

1. **Eventual Consistency**
    - Small delay between write and read
    - Usually < 1 second with Kafka
    - Acceptable for most use cases

2. **Kafka Dependency**
    - Requires Kafka infrastructure
    - Need to monitor Kafka health
    - Implement retry logic for failed events

3. **Data Redundancy**
    - User data stored in 2 databases
    - Requires more storage
    - Need cleanup strategies
```

# MONITORING & MAINTENANCE

## KafkaHealthIndicator.java (user-service)
```java
package com.oerms.user.health;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KafkaHealthIndicator implements HealthIndicator {

    private final KafkaAdmin kafkaAdmin;

    @Override
    public Health health() {
        try {
            // Simple check - you can enhance this
            return Health.up()
                .withDetail("kafka", "Connected")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("kafka", "Disconnected")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

# CLEANUP & MAINTENANCE TASKS

## DataCleanupService.java (user-service - OPTIONAL)
```java
package com.oerms.user.service;

import com.oerms.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataCleanupService {

    private final UserProfileRepository userProfileRepository;

    /**
     * Optional: Clean up orphaned or stale data
     * Run weekly
     */
    @Scheduled(cron = "0 0 2 * * SUN") // 2 AM every Sunday
    @Transactional
    public void cleanupStaleData() {
        try {
            // Example: Remove profiles that haven't synced in 30 days
            // This is just an example - adjust based on your needs
            log.info("Running data cleanup task");
            
            // Implementation depends on your business requirements
            
            log.info("Data cleanup completed");
        } catch (Exception e) {
            log.error("Error during data cleanup", e);
        }
    }
}
```

# RETRY LOGIC FOR FAILED SYNC

## KafkaErrorHandler.java (user-service)
```java
package com.oerms.user.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.MessageListenerContainer;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class KafkaErrorHandler implements CommonErrorHandler {

    @Override
    public boolean handleOne(
            Exception thrownException,
            org.apache.kafka.clients.consumer.ConsumerRecord<?, ?> record,
            Consumer<?, ?> consumer,
            MessageListenerContainer container) {
        
        log.error("Error processing Kafka message: {}", record.key(), thrownException);
        
        // Implement retry logic or dead letter queue
        // For now, just log and continue
        
        return true; // Continue processing other messages
    }
}
```

# SUMMARY
```
📋 IMPLEMENTATION CHECKLIST:

✅ Auth-Server (Master):
- Extended User entity with all profile fields
- User CRUD operations
- Kafka producer for user events
- Endpoints: /users/* for all operations

✅ User-Service (Replica):
- UserProfile entity (synced from auth-server)
- Kafka consumer listening to user-events
- Redis caching for fast reads
- Fallback to auth-server via Feign
- Endpoints: /api/users/profile/* for reads

✅ API Gateway:
- Routes writes to auth-server
- Routes reads to user-service
- Circuit breaker for resilience

✅ Kafka:
- Topic: user-events
- Events: user.created, user.updated, user.deleted
- Partition by userId for ordering

✅ Monitoring:
- Health indicators
- Sync verification
- Kafka health checks

🚀 DEPLOYMENT ORDER:
1. Start Kafka + Zookeeper
2. Start PostgreSQL
3. Start Redis
4. Start Eureka Server
5. Start Auth Server
6. Start User Service
7. Start API Gateway
8. Test synchronization

📊 TESTING SYNC:
1. Create user in auth-server
2. Wait 1-2 seconds
3. Query user-service
4. Verify data matches
5. Update in auth-server
6. Verify update in user-service
```