package com.oerms.userservice.service;

import com.oerms.userservice.dto.*;
import com.oerms.userservice.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    UserDTO createUser(CreateUserRequest request);

    UserDTO getUserById(UUID id);

    Page<UserDTO> getAllUsers(Pageable pageable);

    Page<UserDTO> searchUsers(String search, Role role, Pageable pageable);

    UserDTO updateUser(UUID id, UpdateUserRequest request);

    void deleteUser(UUID id);

    void changePassword(UUID userId, ChangePasswordRequest request);

    long countUsersByRole(Role role);
}
