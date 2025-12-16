package com.oerms.common.event;

import com.oerms.common.dto.AttemptDTO;
import com.oerms.common.enums.AttemptEventType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptEvent {

    // ---- Event Metadata ----
    private UUID eventId;
    private AttemptEventType eventType;
    private LocalDateTime eventTime;
    private String sourceService;

    // ---- Attempt Identifier ----
    private UUID attemptId;

    // ---- Full Attempt Data ----
    private AttemptDTO attemptDTO;
}
