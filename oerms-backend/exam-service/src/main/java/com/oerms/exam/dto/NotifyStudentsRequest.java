package com.oerms.exam.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotifyStudentsRequest {
    private String message;
    private String notificationType; // EMAIL, SMS, IN_APP, PUSH
}
