package com.oerms.exam.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResultDTO {
    private UUID examId;
    private Integer notificationsSent;
    private Integer notificationsFailed;
    private LocalDateTime sentAt;
}
