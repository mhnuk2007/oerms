package com.oerms.userservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oerms.userservice.dto.AuthResponse;
import com.oerms.userservice.dto.LoginRequest;
import com.oerms.userservice.dto.UserDTO;
import com.oerms.userservice.entity.Role;
import com.oerms.userservice.service.AuthenticationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationService authenticationService;

    @Test
    void login_Success() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest("test@example.com", "password123");

        UserDTO userDTO = UserDTO.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .name("Test User")
                .roles(Set.of(Role.STUDENT))
                .build();

        AuthResponse response = AuthResponse.builder()
                .token("jwt_token")
                .refreshToken("refresh_token")
                .user(userDTO)
                .expiresIn(86400L)
                .build();

        when(authenticationService.login(any(LoginRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt_token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh_token"))
                .andExpect(jsonPath("$.user.email").value("test@example.com"));
    }

    @Test
    void login_InvalidCredentials_ReturnsBadRequest() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest("", "");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
