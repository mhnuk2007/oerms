package com.oerms.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptDTO {
    private UUID id;
    private UUID examId;
    private UUID userId;
    private Map<UUID, String> answers;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private String status;
}