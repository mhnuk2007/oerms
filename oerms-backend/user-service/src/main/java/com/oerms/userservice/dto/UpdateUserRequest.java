package com.oerms.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    
    @Email(message = "Email must be valid")
    private String email;
    
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String name;
    
    private String phoneNumber;
    
    private String profilePictureUrl;
    
    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;
}
