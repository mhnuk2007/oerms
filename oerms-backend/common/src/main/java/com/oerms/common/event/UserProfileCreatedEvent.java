package com.oerms.common.event;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileCreatedEvent {
    private UUID profileId;
    private UUID userId;
    private String email;
    private LocalDateTime createdAt;
    private Boolean profileCompleted; // <- add this
}
