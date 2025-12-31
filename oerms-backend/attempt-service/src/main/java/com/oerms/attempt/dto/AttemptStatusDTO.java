package com.oerms.attempt.dto;

import com.oerms.common.enums.AttemptStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptStatusDTO {
    private UUID attemptId;
    private AttemptStatus status;
    private LocalDateTime startedAt;
    private Long elapsedTimeSeconds;
    private Long remainingTimeSeconds;
    private Boolean isExpired;
    private Boolean canSubmit;
}
