package com.oerms.common.event;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRegisteredEvent {

    private UUID userId;
    private String username;
    private String email;
    private Set<String> roles;
    private LocalDateTime registeredAt;
}
