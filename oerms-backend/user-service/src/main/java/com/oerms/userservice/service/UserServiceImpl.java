package com.oerms.userservice.service;

import com.oerms.userservice.dto.ChangePasswordRequest;
import com.oerms.userservice.dto.CreateUserRequest;
import com.oerms.userservice.dto.UpdateUserRequest;
import com.oerms.userservice.dto.UserDTO;
import com.oerms.userservice.entity.Role;
import com.oerms.userservice.entity.User;
import com.oerms.userservice.exception.BadRequestException;
import com.oerms.userservice.exception.ResourceNotFoundException;
import com.oerms.userservice.mapper.UserMapper;
import com.oerms.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDTO createUser(CreateUserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRoles(request.getRoles());

        User savedUser = userRepository.save(user);
        log.info("User created successfully: {}", savedUser.getEmail());

        return userMapper.toDto(savedUser);
    }

    @Override
    @Cacheable(value = "users", key = "#id")
    public UserDTO getUserById(UUID id) {
        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toDto(user);
    }

    @Override
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findByIsDeletedFalse(pageable)
                .map(userMapper::toDto);
    }

    @Override
    public Page<UserDTO> searchUsers(String search, Role role, Pageable pageable) {
        return userRepository.searchUsers(search, role, pageable)
                .map(userMapper::toDto);
    }

    @Override
    @CachePut(value = "users", key = "#id")
    public UserDTO updateUser(UUID id, UpdateUserRequest request) {
        log.info("Updating user: {}", id);

        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check email uniqueness if changed
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
        }

        userMapper.updateEntity(user, request);
        User updatedUser = userRepository.save(user);

        log.info("User updated successfully: {}", id);
        return userMapper.toDto(updatedUser);
    }

    @Override
    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(UUID id) {
        log.info("Deleting user: {}", id);

        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsDeleted(true);
        user.setIsActive(false);
        userRepository.save(user);

        log.info("User soft deleted: {}", id);
    }

    @Override
    @CacheEvict(value = "users", key = "#userId")
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", userId);
    }

    @Override
    public long countUsersByRole(Role role) {
        return userRepository.countByIsDeletedFalseAndRolesContaining(role);
    }
}