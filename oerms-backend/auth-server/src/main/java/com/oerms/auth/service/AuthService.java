package com.oerms.auth.service;

import com.oerms.auth.dto.RegisterRequest;
import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.entity.User;
import com.oerms.auth.kafka.UserEventProducer;
import com.oerms.auth.mapper.UserMapper;
import com.oerms.auth.repository.UserRepository;
import com.oerms.common.enums.Role;
import com.oerms.common.event.UserRegisteredEvent;
import com.oerms.common.exception.ResourceAlreadyExistsException;
import com.oerms.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final UserEventProducer userEventProducer;

    @Transactional
    public UserResponse registerUser(RegisterRequest request) {

        if (userRepository.existsByUserName(request.getUserName())) {
            throw new ResourceAlreadyExistsException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        log.info("Registering new user: {}, {}", request.getUserName(), request.getEmail());

        User user = User.builder()
                .userName(request.getUserName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .roles(resolveRoles(request)) // extracted method
                .build();

        user = userRepository.save(user);

        publishRegistrationEvent(user);

        return userMapper.toUserResponse(user);
    }

    private Set<Role> resolveRoles(RegisterRequest request) {
        return (request.getRoles() != null && !request.getRoles().isEmpty())
                ? request.getRoles()
                : Set.of(Role.STUDENT);
    }

    private void publishRegistrationEvent(User user) {
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(user.getId())
                .username(user.getUserName())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()))
                .registeredAt(LocalDateTime.now())
                .build();

        userEventProducer.publishUserRegisteredEvent(event);

        log.info("UserRegisteredEvent published for userId={}", user.getId());
    }

    @Transactional
    public UserResponse assignRole(UUID userId, Role role) {
        User user = findUser(userId);

        if (user.getRoles().contains(role)) {
            log.warn("Role {} already present for userId={}", role, userId);
            return userMapper.toUserResponse(user);
        }

        user.getRoles().add(role);
        userRepository.save(user);

        log.info("Role {} added for userId={}", role, userId);
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse removeRole(UUID userId, Role role) {
        User user = findUser(userId);

        if (!user.getRoles().contains(role)) {
            log.warn("Role {} not assigned to userId={}", role, userId);
            return userMapper.toUserResponse(user);
        }

        if (user.getRoles().size() <= 1) {
            throw new IllegalStateException("User must always have at least one role");
        }

        user.getRoles().remove(role);
        userRepository.save(user);

        log.info("Role {} removed from userId={}", role, userId);
        return userMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId) {
        return userMapper.toUserResponse(findUser(userId));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with email: " + email));
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public void updateLastLogin(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
            log.info("Updated last login: {}", email);
        });
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + userId));
    }
}
