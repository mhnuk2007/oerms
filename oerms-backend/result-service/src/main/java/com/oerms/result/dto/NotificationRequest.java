package com.oerms.result.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private String message;
    private String notificationType; // EMAIL, SMS, IN_APP
}
