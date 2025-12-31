package com.oerms.exam.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationHistoryDTO {
    private UUID id;
    private UUID examId;
    private String notificationType;
    private String message;
    private Integer recipientCount;
    private LocalDateTime sentAt;
    private String sentBy;
}
