package com.oerms.auth.service;

import com.oerms.auth.dto.RegisterRequest;
import com.oerms.auth.dto.UpdateUserRequest;
import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.entity.User;
import com.oerms.common.event.UserEvent;
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
