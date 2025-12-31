package com.oerms.auth.service;

import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.entity.User;
import com.oerms.auth.mapper.UserMapper;
import com.oerms.auth.repository.UserRepository;
import com.oerms.common.dto.PageResponse;
import com.oerms.common.enums.Role;
import com.oerms.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<UserResponse> page = userRepository.findAll(pageable)
                .map(userMapper::toUserResponse);

        return PageResponse.from(page);
    }

    public PageResponse<UserResponse> searchUsers(String query, Pageable pageable) {
        Page<UserResponse> page = userRepository
                .findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable)
                .map(userMapper::toUserResponse);

        return PageResponse.from(page);
    }


    public UserResponse getUserById(UUID id) {
        return userMapper.toUserResponse(findUser(id));
    }

    public void enableUser(UUID id) {
        User user = findUser(id);
        user.setEnabled(true);
        userRepository.save(user);
        log.info("User enabled: {}", id);
    }

    public void disableUser(UUID id) {
        User user = findUser(id);
        user.setEnabled(false);
        userRepository.save(user);
        log.info("User disabled: {}", id);
    }

    public void lockAccount(UUID id) {
        User user = findUser(id);
        user.setAccountNonLocked(false);
        userRepository.save(user);
        log.info("Account locked: {}", id);
    }

    public void unlockAccount(UUID id) {
        User user = findUser(id);
        user.setAccountNonLocked(true);
        userRepository.save(user);
        log.info("Account unlocked: {}", id);
    }

    public UserResponse assignRole(UUID id, Role role) {
        User user = findUser(id);
        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
            userRepository.save(user);
            log.info("Role {} assigned to userId={}", role, id);
        }
        return userMapper.toUserResponse(user);
    }

    public UserResponse removeRole(UUID id, Role role) {
        User user = findUser(id);
        if (user.getRoles().size() <= 1) {
            throw new IllegalStateException("User must have at least one role");
        }
        if (user.getRoles().contains(role)) {
            user.getRoles().remove(role);
            userRepository.save(user);
            log.info("Role {} removed from userId={}", role, id);
        }
        return userMapper.toUserResponse(user);
    }

    public void deleteUser(UUID id) {
        User user = findUser(id);
        userRepository.delete(user);
        log.info("User deleted: {}", id);
    }

    private User findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
