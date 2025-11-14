package com.oerms.auth.controller;

import com.oerms.auth.dto.RegisterRequest;
import com.oerms.auth.dto.UserResponse;
import com.oerms.auth.service.AuthService;
import com.oerms.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return new ResponseEntity<>(
            ApiResponse.success("User registered successfully", response),
            HttpStatus.CREATED
        );
    }
}