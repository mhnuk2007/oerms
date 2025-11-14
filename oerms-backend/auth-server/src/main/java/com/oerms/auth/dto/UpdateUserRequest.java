package com.oerms.auth.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateUserRequest {
private String firstName;
private String lastName;
private String phone;
private String bio;
private String profileImageUrl;
private LocalDateTime dateOfBirth;
private String address;
private String city;
private String state;
private String country;
}
