package com.oerms.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterResponse {
    private UserResponse user;
    private String redirectUrl;
}
