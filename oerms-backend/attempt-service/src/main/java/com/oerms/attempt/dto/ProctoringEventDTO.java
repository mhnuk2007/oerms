package com.oerms.attempt.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProctoringEventDTO {
    private String eventType;
    private LocalDateTime timestamp;
    private String description;
    private Map<String, Object> metadata;
}
