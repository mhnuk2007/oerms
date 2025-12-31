package com.oerms.attempt.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProctoringHeartbeatRequest {
    private UUID currentQuestionId;
    private Boolean isWindowFocused;
    private LocalDateTime timestamp;
}
