package com.oerms.common.event;

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
public class UserEvent {
private String eventType; // user.created, user.updated, user.deleted
private Long userId;
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
private LocalDateTime timestamp;
}
