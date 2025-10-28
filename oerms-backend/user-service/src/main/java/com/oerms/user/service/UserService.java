package com.oerms.user.service;

import com.oerms.user.dto.UserDTO;
import com.oerms.user.entity.User;
import com.oerms.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public Page<User> findAll(Pageable pageable, String role, String search) {
        if (role != null && search != null) {
            return userRepository.findByRolesContainingAndNameContainingIgnoreCase(role, search, pageable);
        } else if (role != null) {
            return userRepository.findByRolesContaining(role, pageable);
        } else if (search != null) {
            return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        }
        return userRepository.findAll(pageable);
    }

    @Transactional
    public User createUser(UserDTO userDTO) {
        // Validate email uniqueness
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .name(userDTO.getName())
                .roles(userDTO.getRoles() != null ? new HashSet<>(userDTO.getRoles()) : Set.of("STUDENT"))
                .enabled(true)
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(UUID id, UserDTO userDTO) {
        User user = findById(id);

        if (userDTO.getName() != null) {
            user.setName(userDTO.getName());
        }

        if (userDTO.getEmail() != null && !userDTO.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
            user.setEmail(userDTO.getEmail());
        }

        if (userDTO.getRoles() != null) {
            user.setRoles(new HashSet<>(userDTO.getRoles()));
        }

        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = findById(id);
        userRepository.delete(user);
    }
}