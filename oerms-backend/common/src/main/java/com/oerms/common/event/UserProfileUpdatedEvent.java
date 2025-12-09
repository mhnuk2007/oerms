package com.oerms.common.event;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileUpdatedEvent {

    private UUID userId;
    private UUID profileId;
    private Boolean profileCompleted;
    private LocalDateTime updatedAt;
    private String email; // <- add this
}
