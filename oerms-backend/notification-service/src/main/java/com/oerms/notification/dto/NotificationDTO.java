package com.oerms.notification.dto;

import com.oerms.notification.enums.NotificationStatus;
import com.oerms.notification.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private UUID id;
    private UUID userId;
    private NotificationType type;
    private String title;
    private String message;
    private String metadata;
    private NotificationStatus status;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
    private Integer priority;
    private String createdBy;
    private String lastModifiedBy;
}