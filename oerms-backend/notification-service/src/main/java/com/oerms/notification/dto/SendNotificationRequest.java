package com.oerms.notification.dto;

import com.oerms.notification.enums.NotificationType;
import lombok.*;

import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendNotificationRequest {
    private UUID userId;
    private String email;
    private NotificationType type;
    private String title;
    private String message;
    private Map<String, Object> metadata;
    private UUID relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
    private Integer priority;
    private Boolean sendEmail;
    private Boolean sendSms;
    private Boolean sendInApp;
}