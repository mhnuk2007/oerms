package com.oerms.userservice.service;

import com.oerms.userservice.dto.CreateUserRequest;
import com.oerms.userservice.dto.UserDTO;
import com.oerms.userservice.entity.Role;
import com.oerms.userservice.entity.User;
import com.oerms.userservice.exception.BadRequestException;
import com.oerms.userservice.exception.ResourceNotFoundException;
import com.oerms.userservice.mapper.UserMapper;
import com.oerms.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserDTO testUserDTO;
    private CreateUserRequest createRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setPasswordHash("hashed_password");
        testUser.setRoles(Set.of(Role.STUDENT));
        testUser.setIsActive(true);
        testUser.setIsDeleted(false);

        testUserDTO = UserDTO.builder()
                .id(testUser.getId())
                .email(testUser.getEmail())
                .name(testUser.getName())
                .roles(testUser.getRoles())
                .isActive(true)
                .build();

        createRequest = new CreateUserRequest();
        createRequest.setEmail("new@example.com");
        createRequest.setPassword("password123");
        createRequest.setName("New User");
        createRequest.setRoles(Set.of(Role.STUDENT));
    }

    @Test
    void createUser_Success() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userMapper.toEntity(any())).thenReturn(testUser);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any())).thenReturn(testUser);
        when(userMapper.toDto(any())).thenReturn(testUserDTO);

        // Act
        UserDTO result = userService.createUser(createRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo(testUser.getEmail());
        verify(userRepository).existsByEmail(createRequest.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_EmailExists_ThrowsException() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userService.createUser(createRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Email already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    void getUserById_Success() {
        // Arrange
        UUID userId = testUser.getId();
        when(userRepository.findByIdAndIsDeletedFalse(userId)).thenReturn(Optional.of(testUser));
        when(userMapper.toDto(testUser)).thenReturn(testUserDTO);

        // Act
        UserDTO result = userService.getUserById(userId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(userId);
        verify(userRepository).findByIdAndIsDeletedFalse(userId);
    }

    @Test
    void getUserById_NotFound_ThrowsException() {
        // Arrange
        UUID userId = UUID.randomUUID();
        when(userRepository.findByIdAndIsDeletedFalse(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.getUserById(userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void deleteUser_Success() {
        // Arrange
        UUID userId = testUser.getId();
        when(userRepository.findByIdAndIsDeletedFalse(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenReturn(testUser);

        // Act
        userService.deleteUser(userId);

        // Assert
        verify(userRepository).save(argThat(user ->
                user.getIsDeleted() && !user.getIsActive()));
    }
}