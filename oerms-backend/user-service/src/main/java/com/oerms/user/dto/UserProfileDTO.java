package com.oerms.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
private Long id;
private String username;
private String email;
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
private Set<String> roles;
private Boolean enabled;
}
