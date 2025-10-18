package com.oerms.userservice.integration;

import com.oerms.userservice.dto.CreateUserRequest;
import com.oerms.userservice.dto.LoginRequest;
import com.oerms.userservice.dto.UserDTO;
import com.oerms.userservice.entity.Role;
import com.oerms.userservice.repository.UserRepository;
import com.oerms.userservice.service.AuthenticationService;
import com.oerms.userservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
class UserServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void createUserAndLogin_Success() {
        // Arrange
        CreateUserRequest createRequest = new CreateUserRequest();
        createRequest.setEmail("integration@test.com");
        createRequest.setPassword("password123");
        createRequest.setName("Integration Test User");
        createRequest.setRoles(Set.of(Role.STUDENT));

        // Act - Create user
        UserDTO createdUser = userService.createUser(createRequest);

        // Assert user creation
        assertThat(createdUser).isNotNull();
        assertThat(createdUser.getEmail()).isEqualTo("integration@test.com");
        assertThat(createdUser.getName()).isEqualTo("Integration Test User");

        // Act - Login
        LoginRequest loginRequest = new LoginRequest("integration@test.com", "password123");
        var authResponse = authenticationService.login(loginRequest);

        // Assert login
        assertThat(authResponse).isNotNull();
        assertThat(authResponse.getToken()).isNotBlank();
        assertThat(authResponse.getRefreshToken()).isNotBlank();
        assertThat(authResponse.getUser().getEmail()).isEqualTo("integration@test.com");
    }
}
