package com.oerms.result.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResultDTO {
    private Integer totalNotifications;
    private Integer successfulNotifications;
    private Integer failedNotifications;
    private LocalDateTime sentAt;
}
